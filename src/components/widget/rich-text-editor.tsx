import React, { useCallback, useEffect } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import clsx from "clsx";
import { EditorState, LexicalEditor } from "lexical";

type RichTextEditorProp = {
  initialState?: string;
  className?: string;
  editorRef?: React.MutableRefObject<LexicalEditor | undefined>;
  editorStateRef?: React.MutableRefObject<EditorState | undefined>;
};

function onError(error: Error) {
  console.error(error);
}

function EditorStateInitPlugin({ initialState }: { initialState?: string }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    if (initialState) {
      const editorState = editor.parseEditorState(initialState);
      editor.setEditorState(editorState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);
  return null;
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
        onError,
      }}
    >
      <RichTextPlugin
        contentEditable={<ContentEditable className={clsx("w-full h-full rich-editor", className)} />}
        placeholder={<div />}
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
      <OnChangePlugin onChange={onEditorStateChange} />
      <EditorRefPlugin editorRef={editorRef} />
      <EditorStateInitPlugin initialState={initialState} />
    </LexicalComposer>
  );
}
