import React, { useCallback, useEffect } from "react";
import { LinkNode } from "@lexical/link";
import { ListNode, ListItemNode } from "@lexical/list";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import clsx from "clsx";
import { EditorState, LexicalEditor } from "lexical";
import ToolbarPlugin from "@/components/widget/editor/plugins/toolbar-plugin";
import { validateUrl } from "@/components/widget/editor/utils";

type RichTextEditorProp = {
  initialState?: string;
  className?: string;
  editorRef?: React.MutableRefObject<LexicalEditor | undefined>;
  editorStateRef?: React.MutableRefObject<EditorState | undefined>;
};

function onError(error: Error) {
  console.error(error);
}

function EditorRefPlugin({ editorRef }: { editorRef?: React.MutableRefObject<LexicalEditor | undefined> }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (editorRef) {
      editorRef.current = editor;
    }
  }, [editor, editorRef]);
  return null;
}

export default function RichTextEditor({ initialState, className, editorRef, editorStateRef }: RichTextEditorProp) {
  const onEditorStateChange = useCallback(
    (editorState: EditorState) => {
      if (editorStateRef) {
        editorStateRef.current = editorState;
      }
    },
    [editorStateRef],
  );

  return (
    <LexicalComposer
      initialConfig={{
        namespace: "RichEditor",
        editorState: initialState,
        onError,
        theme: {
          text: {
            underline: "underline",
            strikethrough: "line-through",
          },
          link: "link-basic",
          list: {
            nested: {
              listitem: "nested-list-item",
            },
            olDepth: ["ol-depth1", "ol-depth2", "ol-depth3"],
          },
        },
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
      }}
    >
      <div
        className={clsx("flex flex-col w-full h-full bg-base-100 rounded-btn border border-base-content", className)}
      >
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="grow p-2 rich-editor max-h-[calc(100vh_-_155px)] overflow-y-auto" />
          }
          placeholder={<div />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <ListPlugin />
        <LinkPlugin validateUrl={validateUrl} />
        <TabIndentationPlugin />
        <HistoryPlugin />
        <OnChangePlugin onChange={onEditorStateChange} />
        <EditorRefPlugin editorRef={editorRef} />
      </div>
    </LexicalComposer>
  );
}
