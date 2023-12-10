import React from "react";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from "lexical";

export type YouTubePayload = {
  videoId: string;
  time?: string;
  format?: ElementFormatType;
  key?: NodeKey;
};

export type SerializedYouTubeNode = Spread<
  {
    videoId: string;
    time?: string;
  },
  SerializedDecoratorBlockNode
>;

function convertYoutubeElement(domNode: HTMLElement): null | DOMConversionOutput {
  const videoId = domNode.getAttribute("data-youtube-video");
  if (videoId) {
    const node = $createYouTubeNode({
      videoId,
      time: domNode.getAttribute("data-youtube-time") || undefined,
    });
    return { node };
  }
  return null;
}

function getEmbedUrl(videoId: string, time?: string) {
  return `https://www.youtube-nocookie.com/embed/${videoId}${time ? `?start=${time}` : ""}`;
}

export default class YouTubeNode extends DecoratorBlockNode {
  __videoId: string;
  __time?: string;

  constructor(videoId: string, time?: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__videoId = videoId;
    this.__time = time;
  }

  static getType(): string {
    return "youtube";
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__videoId, node.__time, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    const { videoId, time, format } = serializedNode;
    return $createYouTubeNode({
      videoId,
      time,
      format,
    });
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      type: "youtube",
      version: 1,
      videoId: this.__videoId,
      time: this.__time,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("iframe");
    element.setAttribute("data-youtube-video", this.__videoId);
    if (this.__time) {
      element.setAttribute("data-youtube-time", this.__time);
    }
    element.setAttribute("width", "560");
    element.setAttribute("height", "315");
    element.setAttribute("src", getEmbedUrl(this.__videoId, this.__time));
    element.setAttribute("frameborder", "0");
    element.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
    );
    element.setAttribute("allowfullscreen", "true");
    element.setAttribute("title", "YouTube video");
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute("data-youtube-video")) {
          return null;
        }
        return {
          conversion: convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): React.ReactElement {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || "",
      focus: embedBlockTheme.focus || "",
    };
    return (
      <YouTubeComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoId={this.__videoId}
        time={this.__time}
      />
    );
  }
}

export function $createYouTubeNode({ videoId, time, format, key }: YouTubePayload): YouTubeNode {
  return new YouTubeNode(videoId, time, format, key);
}

export function $isYouTubeNode(node: YouTubeNode | LexicalNode | null | undefined): node is YouTubeNode {
  return node instanceof YouTubeNode;
}

function YouTubeComponent({
  className,
  format,
  nodeKey,
  videoId,
  time,
}: {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoId: string;
  time?: string;
}) {
  // noinspection XmlDeprecatedElement
  return (
    <BlockWithAlignableContents nodeKey={nodeKey} className={className} format={format}>
      <iframe
        width={560}
        height={315}
        src={getEmbedUrl(videoId, time)}
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title="YouTube video"
      />
    </BlockWithAlignableContents>
  );
}
