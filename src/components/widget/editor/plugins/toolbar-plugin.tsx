import { useCallback, useEffect, useRef, useState } from "react";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isListNode, ListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode, HeadingTagType, $isHeadingNode, $createQuoteNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import { mergeRegister, $findMatchingParent, $getNearestNodeOfType } from "@lexical/utils";
import clsx from "clsx";
import {
  $createParagraphNode,
  $getSelection,
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
} from "lexical";
import { getSelectedNode, sanitizeUrl, validateUrl } from "@/components/widget/editor/utils";

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [blockType, setBlockType] = useState<keyof typeof BLOCK_TYPES>("paragraph");

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

  const changeLinkUrl = useCallback((url: string) => {
    setLinkUrl(url);
    setIsValidUrl(validateUrl(url) && sanitizeUrl(url) === url);
  }, []);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
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

      const node = getSelectedNode(selection);
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
    );
  }, [editor, $updateToolbar]);

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
        <div className="divider divider-horizontal mx-0.5 hidden md:flex" />
      </div>
      <div className="flex">
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
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
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
                      editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
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
  h1: {
    name: "見出し1",
    icon: "format_h1",
    apply: (editor: LexicalEditor) => {
      formatHeading(editor, "h1");
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