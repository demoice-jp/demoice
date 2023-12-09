import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import Compressor from "compressorjs";
import {
  $createParagraphNode,
  $createRangeSelection,
  $getSelection,
  $insertNodes,
  $isNodeSelection,
  $isRootOrShadowRoot,
  $setSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DRAGOVER_COMMAND,
  DRAGSTART_COMMAND,
  DROP_COMMAND,
  LexicalCommand,
  LexicalEditor,
} from "lexical";
import { ImagePostError, ImagePostResponse } from "@/app/api/media/content/[id]/image/route";
import { $createImageNode, $isImageNode, ImageNode, ImagePayload } from "@/components/widget/editor/nodes/ImageNode";

export type InsertImagePayload = Readonly<ImagePayload>;

export type UploadImageResult = ImagePostResponse & {
  size: {
    width: number;
    height: number;
  };
};

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand("INSERT_IMAGE_COMMAND");

const MAX_IMAGE_UPLOAD_SIZE = 2_000_000;

function compressImage(imageFile: File): Promise<File | Blob> {
  return new Promise((resolve, reject) => {
    if (!(imageFile.type === "image/png" || imageFile.type === "image/jpeg")) {
      resolve(imageFile);
      return;
    }
    new Compressor(imageFile, {
      strict: true,
      checkOrientation: true,
      retainExif: false,
      maxWidth: 1080,
      maxHeight: 1080,
      quality: 0.9,
      convertTypes: ["image/png"],
      convertSize: 1_000_000,
      success(file: File | Blob) {
        resolve(file);
      },
      error(error: Error) {
        reject(error);
      },
    });
  });
}

export function uploadImage(contentId: string, imageFile: File): Promise<UploadImageResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") {
          reject(Error("画像ファイルを読み込めませんでした"));
          return;
        }

        const uploadBody = JSON.stringify({
          image: dataUrl,
        });
        if (uploadBody.length > MAX_IMAGE_UPLOAD_SIZE) {
          reject(new Error("画像のファイルサイズが大きすぎます"));
          return;
        }

        const [response, size] = await Promise.all([
          fetch(`/api/media/content/${contentId}/image`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: uploadBody,
          }),
          new Promise<{ width: number; height: number }>((resolve) => {
            const imgElementForGetSize = new Image();
            imgElementForGetSize.onload = () => {
              resolve({
                width: imgElementForGetSize.naturalWidth,
                height: imgElementForGetSize.naturalHeight,
              });
            };
            imgElementForGetSize.src = dataUrl;
          }),
        ]);

        if (response.ok) {
          const body: ImagePostResponse = await response.json();

          if (document) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            (document.getElementById("insert_image_modal") as HTMLFormElement)?.close();
          }
          resolve({
            ...body,
            size,
          });
        } else {
          const { message }: ImagePostError = await response.json();
          reject(new Error(message));
        }
      } catch (e) {
        console.log(e);
        reject(new Error("画像の挿入に失敗しました"));
      }
    };

    compressImage(imageFile)
      .then((compressedImage) => {
        reader.readAsDataURL(compressedImage);
      })
      .catch((e) => {
        console.log(e);
        reject(new Error("画像の圧縮に失敗しました"));
      });
  });
}

export default function ImagePlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([ImageNode])) {
      throw new Error("ImagesPlugin: ImageNode not registered on editor");
    }

    // キャッシュさせる
    getTransparentImgElement();

    return mergeRegister(
      editor.registerCommand<InsertImagePayload>(
        INSERT_IMAGE_COMMAND,
        (payload) => {
          const imageNode = $createImageNode(payload);
          $insertNodes([imageNode]);
          if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
            $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
          }
          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
      editor.registerCommand<DragEvent>(
        DRAGSTART_COMMAND,
        (event) => {
          return onDragStart(event);
        },
        COMMAND_PRIORITY_HIGH,
      ),
      editor.registerCommand<DragEvent>(
        DRAGOVER_COMMAND,
        (event) => {
          return onDragover(event);
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<DragEvent>(
        DROP_COMMAND,
        (event) => {
          return onDrop(event, editor);
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor]);

  return null;
}

let imgCache: null | HTMLImageElement = null;
function getTransparentImgElement() {
  if (imgCache) {
    return imgCache;
  }
  // noinspection SpellCheckingInspection
  const TRANSPARENT_IMAGE = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  const img = document.createElement("img");
  img.src = TRANSPARENT_IMAGE;
  imgCache = img;
  return imgCache;
}

function onDragStart(event: DragEvent) {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const dataTransfer = event.dataTransfer;
  if (!dataTransfer) {
    return false;
  }
  dataTransfer.setData("text/plain", "_");
  dataTransfer.setDragImage(getTransparentImgElement(), 0, 0);
  dataTransfer.setData(
    "application/x-lexical-drag",
    JSON.stringify({
      data: {
        altText: node.__altText,
        height: node.__height,
        key: node.getKey(),
        src: node.__src,
        width: node.__width,
      },
      type: "image",
    }),
  );

  return true;
}

function onDragover(event: DragEvent): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  if (!canDropImage(event)) {
    event.preventDefault();
  }
  return true;
}

function onDrop(event: DragEvent, editor: LexicalEditor): boolean {
  const node = getImageNodeInSelection();
  if (!node) {
    return false;
  }
  const data = getDragImageData(event);
  if (!data) {
    return false;
  }
  event.preventDefault();
  if (canDropImage(event)) {
    const range = getDragSelection(event);
    node.remove();
    const rangeSelection = $createRangeSelection();
    if (range !== null && range !== undefined) {
      rangeSelection.applyDOMRange(range);
    }
    $setSelection(rangeSelection);
    editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
  }
  return true;
}

function getDragImageData(event: DragEvent): null | InsertImagePayload {
  const dragData = event.dataTransfer?.getData("application/x-lexical-drag");
  if (!dragData) {
    return null;
  }
  const { type, data } = JSON.parse(dragData);
  if (type !== "image") {
    return null;
  }

  return data as InsertImagePayload;
}

function canDropImage(event: DragEvent): boolean {
  const target = event.target;
  return !!(
    target &&
    target instanceof HTMLElement &&
    !target.closest("span.content-image") &&
    target.parentElement &&
    target.parentElement.closest("div.rich-editor")
  );
}

function getImageNodeInSelection(): ImageNode | null {
  const selection = $getSelection();
  if (!$isNodeSelection(selection)) {
    return null;
  }
  const nodes = selection.getNodes();
  const node = nodes[0];
  return $isImageNode(node) ? node : null;
}

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
  window && window.document ? (targetWindow || window).getSelection() : null;

function getDragSelection(event: DragEvent): Range | null | undefined {
  let range;
  const target = event.target as null | Element | Document;
  const targetWindow =
    target == null
      ? null
      : target.nodeType === 9
        ? (target as Document).defaultView
        : (target as Element).ownerDocument.defaultView;
  const domSelection = getDOMSelection(targetWindow);
  // noinspection JSDeprecatedSymbols
  if (document.caretRangeFromPoint) {
    // noinspection JSDeprecatedSymbols
    range = document.caretRangeFromPoint(event.clientX, event.clientY);
  } else {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    if (event.rangeParent && domSelection !== null) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      domSelection.collapse(event.rangeParent, event.rangeOffset || 0);
      range = domSelection.getRangeAt(0);
    } else {
      throw Error(`Cannot get the selection when dragging`);
    }
  }

  return range;
}
