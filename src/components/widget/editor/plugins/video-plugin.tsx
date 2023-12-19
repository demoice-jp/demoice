import { useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister, $insertNodeToNearestRoot } from "@lexical/utils";
import { COMMAND_PRIORITY_EDITOR, createCommand, LexicalCommand } from "lexical";
import YouTubeNode, { $createYouTubeNode } from "@/components/widget/editor/nodes/you-tube-node";

export type InsertVideoPayload = {
  type: "youtube";
  videoId: string;
  url: string;
  time?: string;
};

export const INSERT_VIDEO_COMMAND: LexicalCommand<InsertVideoPayload> = createCommand("INSERT_VIDEO_COMMAND");

const YOUTUBE_REGEX =
  /^https?:\/\/(?:www.youtube.com|youtu.be|youtube.com)\/(?:embed\/)?(?:watch\?)?(?:v=)?(?:feature=[a-z_]+&)?(?:v=)?([a-zA-Z0-9-=_]{11})(?:&feature=[a-z_]*)?(?:\?t=([0-9mhs]+))?/;

export function parseVideoUrl(url: string): InsertVideoPayload | null {
  const match = YOUTUBE_REGEX.exec(url);

  if (match && match[1]) {
    return {
      type: "youtube",
      videoId: match[1],
      url: url,
      time: match[2],
    };
  }

  return null;
}

export default function VideoPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([YouTubeNode])) {
      throw new Error("VideoPlugin: YouTubeNode not registered on editor");
    }

    return mergeRegister(
      editor.registerCommand<InsertVideoPayload>(
        INSERT_VIDEO_COMMAND,
        (payload) => {
          const videoNode = $createYouTubeNode({
            videoId: payload.videoId,
            time: payload.time,
            format: "center",
          });
          $insertNodeToNearestRoot(videoNode);

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [editor]);

  return null;
}
