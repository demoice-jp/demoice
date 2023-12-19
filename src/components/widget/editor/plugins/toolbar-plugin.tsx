import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { $createHeadingNode, HeadingTagType, $isHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister, $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import clsx from "clsx";
import dayjs from "dayjs";
import {
  $createParagraphNode,
  $getSelection,
  $isNodeSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  LexicalEditor,
  LexicalNode,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  $isElementNode,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  COMMAND_PRIORITY_HIGH,
} from "lexical";
import { useContentContext } from "@/components/hooks";
import { AUTO_SAVED_COMMAND, AutoSavePayload } from "@/components/widget/editor/plugins/auto-save-plugin";
import { INSERT_IMAGE_COMMAND, uploadImage } from "@/components/widget/editor/plugins/image-plugin";
import { INSERT_VIDEO_COMMAND, parseVideoUrl } from "@/components/widget/editor/plugins/video-plugin";
import { getSelectedNode, sanitizeUrl, validateUrl } from "@/components/widget/editor/utils";
import FormError from "@/components/widget/form-error";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const { id: contentId } = useContentContext();
  const [blockType, setBlockType] = useState<keyof typeof BLOCK_TYPES>("paragraph");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

  const [textFormat, setTextFormat] = useState({
    bold: false,
    italic: false,
    underlined: false,
    strikethrough: false,
  });
  const [isLink, setIsLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const linkDropdownRef = useRef<HTMLDivElement>(null);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [imageLoadError, setImageLoadError] = useState<string>("");

  const [videoUrl, setVideoUrl] = useState("");
  const [videoUrlError, setVideoUrlError] = useState("");

  const [autoSaveState, setAutoSaveState] = useState<AutoSavePayload | null>(null);

  const changeLinkUrl = useCallback((url: string) => {
    setLinkUrl(url);
    setIsValidUrl(validateUrl(url) && sanitizeUrl(url) === url);
  }, []);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();

    let node: LexicalNode | null = null;
    if ($isRangeSelection(selection)) {
      const anchorNode: LexicalNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow() as LexicalNode;
      }

      const elementKey = element.getKey();
      const elementDom = editor.getElementByKey(elementKey);

      setTextFormat({
        bold: selection.hasFormat("bold"),
        italic: selection.hasFormat("italic"),
        underlined: selection.hasFormat("underline"),
        strikethrough: selection.hasFormat("strikethrough"),
      });

      node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setIsLink(true);
        changeLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setIsLink(true);
        changeLinkUrl(node.getURL());
      } else {
        setIsLink(false);
        changeLinkUrl("");
      }

      if (elementDom !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : element.getListType();
          if (type === "number" || type === "bullet") {
            setBlockType(type);
          }
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in BLOCK_TYPES) {
            setBlockType(type as keyof typeof BLOCK_TYPES);
          }
        }
      }
    } else if ($isNodeSelection(selection)) {
      node = selection.getNodes()[0];
    }

    if (node) {
      const matchingParent = $findMatchingParent(
        node,
        (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
      );
      const parent = node.getParent();
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : $isDecoratorBlockNode(node)
              ? node.__format
              : $isElementNode(parent)
                ? parent.getFormatType()
                : "left",
      );
    }
  }, [editor, changeLinkUrl]);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          $updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          if (payload.target instanceof HTMLElement) {
            let aTagFound = false;
            let target: HTMLElement | null = payload.target;
            while (target) {
              if (target.tagName === "A") {
                aTagFound = true;
                break;
              }
              target = target.parentElement;
            }

            if (aTagFound) {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                const node = getSelectedNode(selection);
                const linkNode = $findMatchingParent(node, $isLinkNode);
                if ($isLinkNode(linkNode)) {
                  if (payload.metaKey || payload.ctrlKey) {
                    window.open(linkNode.getURL(), "_blank");
                  } else {
                    linkDropdownRef.current?.focus();
                  }
                  return true;
                }
              }
            }
          }
          return false;
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        AUTO_SAVED_COMMAND,
        (payload) => {
          setAutoSaveState(payload);
          return false;
        },
        COMMAND_PRIORITY_HIGH,
      ),
    );
  }, [editor, $updateToolbar]);

  const insertImage = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) {
        return;
      }

      setIsLoadingImage(true);

      uploadImage(contentId, files[0])
        .then((response) => {
          if (document) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            (document.getElementById("insert_image_modal") as HTMLFormElement)?.close();
          }

          editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
            src: response.location,
            altText: "挿入画像",
            width: response.size.width,
            height: response.size.height,
          });
        })
        .catch((e: Error) => {
          if (imageFileInputRef.current) {
            imageFileInputRef.current.value = "";
          }
          setImageLoadError(e.message);
        })
        .finally(() => {
          setIsLoadingImage(false);
        });
    },
    [editor, contentId],
  );

  return (
    <div className="flex flex-col w-full p-2 border-b border-base-content md:flex-row">
      <div className="flex">
        <button
          type="button"
          disabled={!canUndo}
          className="btn btn-ghost btn-xs"
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
          aria-label="元に戻す"
        >
          <span className="material-symbols-outlined">undo</span>
        </button>
        <button
          type="button"
          disabled={!canRedo}
          className="btn btn-ghost btn-xs"
          onClick={() => {
            editor.dispatchCommand(REDO_COMMAND, undefined);
          }}
          aria-label="やり直し"
        >
          <span className="material-symbols-outlined">redo</span>
        </button>
        <div className="divider divider-horizontal mx-0.5" />
        <BlockFormatDropDown editor={editor} blockType={blockType} />
        <div className="dropdown lg:hidden">
          <button tabIndex={0} role="button" className="btn btn-ghost btn-xs">
            <span className="material-symbols-outlined">format_indent_increase</span>
            <span className="material-symbols-outlined -ml-2">expand_more</span>
          </button>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-44">
            <li>
              <button
                onClick={() => {
                  editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
                }}
              >
                <span className="material-symbols-outlined">format_indent_increase</span>
                インデント
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
                }}
              >
                <span className="material-symbols-outlined">format_indent_decrease</span>
                アウトデント
              </button>
            </li>
          </ul>
        </div>
        <div className="gap-[0.1em] hidden lg:flex">
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => {
              editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
            }}
            aria-label="インデント"
          >
            <span className="material-symbols-outlined">format_indent_increase</span>
          </button>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => {
              editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
            }}
            aria-label="アウトデント"
          >
            <span className="material-symbols-outlined">format_indent_decrease</span>
          </button>
        </div>
        <FormatElementDropDown editor={editor} formatType={elementFormat} />
        <div className="divider divider-horizontal mx-0.5 hidden md:flex" />
      </div>
      <div className="flex grow">
        <div className="flex gap-[0.1em]">
          <div className="dropdown">
            <div
              tabIndex={0}
              role="button"
              className={clsx("btn btn-ghost btn-xs", isLink && "btn-active")}
              ref={linkDropdownRef}
            >
              <span className="material-symbols-outlined">link</span>
            </div>
            <div
              tabIndex={0}
              className="dropdown-content z-[1] menu shadow bg-base-100 rounded-box w-80 md:w-[26rem] lg:w-[30rem]"
            >
              <div className="flex flex-col lg:flex-row">
                <input
                  type="text"
                  onChange={(e) => {
                    changeLinkUrl(e.currentTarget.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isValidUrl) {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                        url: linkUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      });
                      e.preventDefault();
                    }
                  }}
                  placeholder="URLを入力して下さい"
                  value={linkUrl}
                  className="single-line-input w-full"
                />
                <div className="flex justify-end ms-1">
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={!isValidUrl}
                    onClick={() => {
                      window.open(linkUrl, "_blank");
                    }}
                  >
                    <span className="material-symbols-outlined">open_in_new</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-green-600"
                    disabled={!isValidUrl}
                    onClick={() => {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, {
                        url: linkUrl,
                        target: "_blank",
                        rel: "noopener noreferrer",
                      });
                    }}
                  >
                    <span className="material-symbols-outlined">done</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm text-red-800"
                    disabled={!isLink}
                    onClick={() => {
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                      changeLinkUrl("");
                    }}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown lg:hidden">
          <button tabIndex={0} role="button" className="btn btn-ghost btn-xs">
            <span className="material-symbols-outlined">match_case</span>
            <span className="material-symbols-outlined -ml-2">expand_more</span>
          </button>
          <div tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-48">
            <TextFormatButtons editor={editor} textFormat={textFormat} />
          </div>
        </div>
        <div className="hidden lg:flex">
          <TextFormatButtons editor={editor} textFormat={textFormat} />
        </div>
        <div className="divider divider-horizontal mx-0.5" />
        <div>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => {
              if (imageFileInputRef.current) {
                imageFileInputRef.current.value = "";
              }
              setImageLoadError("");

              if (document) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                (document.getElementById("insert_image_modal") as HTMLFormElement)?.showModal();
              }
            }}
            aria-label="画像"
          >
            <span className="material-symbols-outlined">image</span>
          </button>
          <dialog id="insert_image_modal" className="modal">
            <div className="modal-box">
              <h4>画像を挿入</h4>
              <input
                type="file"
                className={clsx("file-input file-input-bordered w-full", isLoadingImage && "hidden")}
                accept="image/png,image/jpeg,image/gif"
                ref={imageFileInputRef}
                onChange={insertImage}
              />
              <FormError messages={imageLoadError} />
              <progress className={clsx("progress my-5", !isLoadingImage && "hidden")} />
              <div className="modal-action">
                <form method="dialog">
                  <button className="btn btn-ghost" disabled={isLoadingImage}>
                    キャンセル
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
        <div>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => {
              setVideoUrl("");
              setVideoUrlError("");
              if (document) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                (document.getElementById("insert_video_modal") as HTMLFormElement)?.showModal();
              }
            }}
            aria-label="動画"
          >
            <span className="material-symbols-outlined">videocam</span>
          </button>
          <dialog id="insert_video_modal" className="modal">
            <div className="modal-box">
              <h4>Youtube動画を挿入</h4>
              <input
                type="text"
                className="input input-bordered w-full"
                placeholder="https://youtu.be/ZAq12wSXcDe?t=100"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <FormError messages={videoUrlError} />
              <div className="modal-action">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    const parsed = parseVideoUrl(videoUrl);
                    if (!parsed) {
                      setVideoUrlError("Youtube動画のURLではありません");
                      return;
                    }
                    if (document) {
                      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
                      (document.getElementById("insert_video_modal") as HTMLFormElement)?.close();
                    }
                    editor.dispatchCommand(INSERT_VIDEO_COMMAND, parsed);
                  }}
                >
                  挿入
                </button>
                <form method="dialog">
                  <button className="btn btn-ghost">キャンセル</button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
        <div className="flex grow items-center justify-end">
          <div
            className="tooltip tooltip-bottom before:translate-x-[-90%]"
            data-tip={
              autoSaveState == null
                ? "30秒おきに自動保存されます"
                : autoSaveState.success
                  ? `${dayjs(autoSaveState.updated).format("H時m分s秒に自動保存されました")}`
                  : "自動保存に失敗しました"
            }
          >
            <button
              disabled
              className={clsx(
                "btn btn-ghost btn-xs",
                autoSaveState == null
                  ? "disabled:text-current"
                  : autoSaveState.success
                    ? "disabled:text-green-600"
                    : "disabled:text-red-700",
              )}
            >
              <span className="material-symbols-outlined">check_circle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const BLOCK_TYPES = {
  paragraph: {
    name: "段落",
    icon: "notes",
    apply: (editor: LexicalEditor) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          $setBlocksType(selection, () => $createParagraphNode());
        }
      });
    },
  },
  h2: {
    name: "見出し2",
    icon: "format_h2",
    apply: (editor: LexicalEditor) => {
      formatHeading(editor, "h2");
    },
  },
  h3: {
    name: "見出し3",
    icon: "format_h3",
    apply: (editor: LexicalEditor) => {
      formatHeading(editor, "h3");
    },
  },
  h4: {
    name: "見出し4",
    icon: "format_h4",
    apply: (editor: LexicalEditor) => {
      formatHeading(editor, "h4");
    },
  },
  bullet: {
    name: "箇条書き",
    icon: "format_list_bulleted",
    apply: (editor: LexicalEditor, blockType: string) => {
      if (blockType !== "bullet") {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
      }
    },
  },
  number: {
    name: "順序",
    icon: "format_list_numbered",
    apply: (editor: LexicalEditor, blockType: string) => {
      if (blockType !== "number") {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
      }
    },
  },
  quote: {
    name: "引用",
    icon: "format_quote",
    apply: (editor: LexicalEditor, blockType: string) => {
      if (blockType !== "quote") {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            $setBlocksType(selection, () => $createQuoteNode());
          }
        });
      }
    },
  },
};

function formatHeading(editor: LexicalEditor, headingType: HeadingTagType) {
  editor.update(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      $setBlocksType(selection, () => $createHeadingNode(headingType));
    }
  });
}

function BlockFormatDropDown({ editor, blockType }: { editor: LexicalEditor; blockType: keyof typeof BLOCK_TYPES }) {
  const currentBlockType = BLOCK_TYPES[blockType];

  return (
    <div className="dropdown">
      <button tabIndex={0} role="button" className="btn btn-ghost btn-xs">
        <span className="material-symbols-outlined">{currentBlockType.icon}</span>
        <span className="hidden lg:inline">{currentBlockType.name}</span>
        <span className="material-symbols-outlined -ml-2">expand_more</span>
      </button>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-40">
        {Object.entries(BLOCK_TYPES).map(([key, type]) => {
          return (
            <li key={key}>
              <button
                onClick={() => {
                  type.apply(editor, blockType);
                }}
              >
                <span className="material-symbols-outlined">{type.icon}</span>
                {type.name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const ELEMENT_FORMAT: {
  [key: string]: {
    text: string;
    icon: string;
  };
} = {
  left: {
    text: "左揃え",
    icon: "format_align_left",
  },
  center: {
    text: "中央揃え",
    icon: "format_align_center",
  },
  right: {
    text: "右揃え",
    icon: "format_align_right",
  },
};

function FormatElementDropDown({ editor, formatType }: { editor: LexicalEditor; formatType: ElementFormatType }) {
  const format = ELEMENT_FORMAT[formatType] || ELEMENT_FORMAT.left;

  return (
    <div className="dropdown max-sm:dropdown-end">
      <button tabIndex={0} role="button" className="btn btn-ghost btn-xs">
        <span className="material-symbols-outlined">{format.icon}</span>
        <span className="material-symbols-outlined -ml-2">expand_more</span>
      </button>
      <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-36">
        {Object.entries(ELEMENT_FORMAT).map(([key, format]) => {
          return (
            <li key={key}>
              <button
                onClick={() => {
                  editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, key as ElementFormatType);
                }}
              >
                <span className="material-symbols-outlined">{format.icon}</span>
                {format.text}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function TextFormatButtons({
  editor,
  textFormat,
}: {
  editor: LexicalEditor;
  textFormat: {
    bold: boolean;
    italic: boolean;
    underlined: boolean;
    strikethrough: boolean;
  };
}) {
  return (
    <div>
      <button
        type="button"
        className={clsx("btn btn-ghost btn-xs", textFormat.bold && "btn-active")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        aria-label="太字"
      >
        <span className="material-symbols-outlined">format_bold</span>
      </button>
      <button
        type="button"
        className={clsx("btn btn-ghost btn-xs", textFormat.italic && "btn-active")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        aria-label="斜体"
      >
        <span className="material-symbols-outlined">format_italic</span>
      </button>
      <button
        type="button"
        className={clsx("btn btn-ghost btn-xs", textFormat.underlined && "btn-active")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        aria-label="下線"
      >
        <span className="material-symbols-outlined">format_underlined</span>
      </button>
      <button
        type="button"
        className={clsx("btn btn-ghost btn-xs", textFormat.strikethrough && "btn-active")}
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        aria-label="取り消し線"
      >
        <span className="material-symbols-outlined">format_strikethrough</span>
      </button>
    </div>
  );
}
