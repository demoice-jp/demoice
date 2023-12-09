import React from "react";
import {
  $applyNodeReplacement,
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

export type ImagePayload = {
  altText: string;
  src: string;
  width: number;
  height: number;
  key?: NodeKey;
};

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number;
    height: number;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ src, altText, width, height });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __altText: string;
  __width: number;
  __height: number;
  constructor(src: string, altText: string, width: number, height: number, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode) {
    const { src, altText, width, height } = serializedNode;
    return $createImageNode({
      src,
      altText,
      width,
      height,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      version: 1,
      type: "image",
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    element.setAttribute("width", String(this.__width));
    element.setAttribute("height", String(this.__height));
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): React.ReactElement {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={this.__altText} src={this.__src} width={this.__width} height={this.__height} />;
  }
}

export function $createImageNode({ src, altText, width, height, key }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
