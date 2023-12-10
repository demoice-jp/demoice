import React, { useCallback, useEffect, useRef } from "react";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { DecoratorBlockNode, SerializedDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import clsx from "clsx";
import {
  $applyNodeReplacement,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
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

export type ImagePayload = {
  altText: string;
  src: string;
  width: number;
  height: number;
  format?: ElementFormatType;
  key?: NodeKey;
};

export type SerializedImageNode = Spread<
  {
    src: string;
    altText: string;
    width: number;
    height: number;
  },
  SerializedDecoratorBlockNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { alt: altText, src, width, height } = domNode;
    const node = $createImageNode({ src, altText, width, height });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorBlockNode {
  __src: string;
  __altText: string;
  __width: number;
  __height: number;
  constructor(src: string, altText: string, width: number, height: number, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
  }

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode) {
    const { src, altText, width, height, format } = serializedNode;
    return $createImageNode({
      src,
      altText,
      width,
      height,
      format,
    });
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      version: 1,
      type: "image",
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
    };
  }

  exportDOM(editor: LexicalEditor): DOMExportOutput {
    const config = editor._config;
    const divWrapElement = document.createElement("div");
    divWrapElement.className = clsx(config.theme.embedBlock?.base, config.theme.image);
    if (this.__format) {
      divWrapElement.style.textAlign = this.__format;
    }

    const imgElement = document.createElement("img");
    imgElement.setAttribute("src", this.__src);
    imgElement.setAttribute("alt", this.__altText);
    imgElement.setAttribute("width", String(this.__width));
    imgElement.setAttribute("height", String(this.__height));

    divWrapElement.appendChild(imgElement);

    return { element: divWrapElement };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  updateDOM(): false {
    return false;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): React.ReactElement {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: clsx(embedBlockTheme.base, config.theme.image),
      focus: embedBlockTheme.focus || "",
    };
    return (
      <ImageComponent
        className={className}
        format={this.__format}
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        nodeKey={this.getKey()}
      />
    );
  }
}

export function $createImageNode({ src, altText, width, height, format, key }: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, width, height, format, key));
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

function ImageComponent({
  className,
  format,
  nodeKey,
  altText,
  src,
  width,
  height,
}: {
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  altText: string;
  src: string;
  width: number;
  height: number;
}) {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<null | HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload;

      if (event.target === imageRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected);
        } else {
          clearSelection();
          setSelected(true);
        }
        return true;
      }

      return false;
    },
    [isSelected, setSelected, clearSelection],
  );

  useEffect(() => {
    return editor.registerCommand<MouseEvent>(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW);
  }, [editor, onClick]);

  return (
    <BlockWithAlignableContents className={className} format={format} nodeKey={nodeKey}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} alt={altText} src={src} width={width} height={height} draggable={false} />
    </BlockWithAlignableContents>
  );
}
