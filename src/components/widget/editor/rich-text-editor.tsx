import React, { useCallback, useEffect, useState } from "react";
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
import { ContentContext } from "@/components/contexts";
import { ImageNode } from "@/components/widget/editor/nodes/image-node";
import YouTubeNode from "@/components/widget/editor/nodes/you-tube-node";
import ImagePlugin from "@/components/widget/editor/plugins/image-plugin";
import ToolbarPlugin from "@/components/widget/editor/plugins/toolbar-plugin";
import VideoPlugin from "@/components/widget/editor/plugins/video-plugin";
import { validateUrl } from "@/components/widget/editor/utils";

type RichTextEditorProp = {
  contentContext: ContentContext;
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

export default function RichTextEditor({
  contentContext,
  initialState,
  className,
  editorRef,
  editorStateRef,
}: RichTextEditorProp) {
  const [editorStyle, setEditorStyle] = useState({});

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) {
      setEditorStyle({});
      return;
    }

    const resizeListener = () => {
      setEditorStyle({
        maxHeight: `${vv.height - 155}px`,
      });
    };

    vv.addEventListener("resize", resizeListener);
    resizeListener();
    return () => vv.removeEventListener("resize", resizeListener);
  }, []);

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
          image: "content-image",
          embedBlock: {
            base: "embed-block",
            focus: "focused-embed-block",
          },
        },
        nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode, YouTubeNode],
      }}
    >
      <ContentContext.Provider value={contentContext}>
        <div
          className={clsx("flex flex-col w-full h-full bg-base-100 rounded-btn border border-base-content", className)}
        >
          <ToolbarPlugin />
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                style={editorStyle} //スマホソフトキーボード対応
                className="grow p-2 rich-editor max-h-[calc(100vh_-_155px)] overflow-y-auto"
              />
            }
            placeholder={<div />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin validateUrl={validateUrl} />
          <ImagePlugin />
          <VideoPlugin />
          <TabIndentationPlugin />
          <HistoryPlugin />
          <OnChangePlugin onChange={onEditorStateChange} />
          <EditorRefPlugin editorRef={editorRef} />
        </div>
      </ContentContext.Provider>
    </LexicalComposer>
  );
}
