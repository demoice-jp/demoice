import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import Compressor from "compressorjs";
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  LexicalCommand,
} from "lexical";
import { ImagePostError, ImagePostResponse } from "@/app/api/media/content/[id]/image/route";
import { $createImageNode, ImageNode, ImagePayload } from "@/components/widget/editor/nodes/ImageNode";

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
    );
  }, [editor]);

  return null;
}
