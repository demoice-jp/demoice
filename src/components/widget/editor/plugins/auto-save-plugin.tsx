import { useEffect, useState } from "react";
import { $generateHtmlFromNodes } from "@lexical/html";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import dayjs from "dayjs";
import { $getRoot, createCommand, LexicalCommand } from "lexical";
import { useDebouncedCallback } from "use-debounce";
import { useContentContext } from "@/components/hooks";

const DEBOUNCED_WAIT = 30_000;

export type AutoSavePayload = {
  success: boolean;
  updated: Date;
};

export const AUTO_SAVED_COMMAND: LexicalCommand<AutoSavePayload> = createCommand("AUTO_SAVED_COMMAND");

export default function AutoSavePlugin() {
  const [editor] = useLexicalComposerContext();
  const contentContext = useContentContext();
  const [lastState, setLastState] = useState("");

  const debouncedUpdate = useDebouncedCallback(
    () => {
      const editorState = editor.getEditorState();
      const latest = JSON.stringify(editorState.toJSON());
      if (latest === lastState) {
        return;
      }

      editorState.read(() => {
        fetch(`/api/content/${contentContext.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: latest,
            contentHtml: $generateHtmlFromNodes(editor),
            contentString: $getRoot().getTextContent(),
          }),
        })
          .then((res) => {
            if (res.ok) {
              res.json().then((j: { updated: string }) => {
                setLastState(latest);
                editor.dispatchCommand(AUTO_SAVED_COMMAND, {
                  success: true,
                  updated: dayjs(j.updated).toDate(),
                });
              });
            } else {
              editor.dispatchCommand(AUTO_SAVED_COMMAND, {
                success: false,
                updated: new Date(),
              });
            }
          })
          .catch((e) => {
            console.error(e);
            editor.dispatchCommand(AUTO_SAVED_COMMAND, {
              success: false,
              updated: new Date(),
            });
          });
      });
    },
    DEBOUNCED_WAIT,
    {
      maxWait: DEBOUNCED_WAIT,
    },
  );

  useEffect(() => {
    setLastState(JSON.stringify(editor.getEditorState().toJSON()));

    return editor.registerUpdateListener(() => {
      debouncedUpdate();
    });
  }, [editor, debouncedUpdate]);

  return null;
}
