import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';
import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode';
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  ElementFormatType,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
} from 'lexical';

type SteamComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  appID: string;
}>;

export type SerializedSteamNode = Spread<
  {
    appID: string;
  },
  SerializedDecoratorBlockNode
>;

function SteamComponent({
  className,
  format,
  nodeKey,
  appID,
}: SteamComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}
    >
      <iframe
        src={`https://store.steampowered.com/widget/${appID}`}
        loading="lazy"
        title="Steam App"
        className="absolute inset-0 w-full h-fit rounded-md"
      />
    </BlockWithAlignableContents>
  );
}

function convertSteamElement(domNode: HTMLElement): null | DOMConversionOutput {
  const appID = domNode.getAttribute('data-lexical-steam');
  if (appID) {
    const node = $createSteamNode(appID);
    return { node };
  }
  return null;
}

export class SteamNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return 'steam';
  }

  static clone(node: SteamNode): SteamNode {
    return new SteamNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedSteamNode): SteamNode {
    const node = $createSteamNode(serializedNode.appID);
    node.setFormat(serializedNode.format);
    return node;
  }

  exportJSON(): SerializedSteamNode {
    return {
      ...super.exportJSON(),
      type: 'steam',
      version: 1,
      appID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-steam', this.__id);
    element.setAttribute(
      'src',
      `https://store.steampowered.com/widget/${this.__id}`
    );
    element.setAttribute('title', 'Steam app');
    element.setAttribute('height', '315');
    element.style.width = '100%';
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-steam')) {
          return null;
        }
        return {
          conversion: convertSteamElement,
          priority: 1,
        };
      },
    };
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  getTextContent(): string {
    return `https://store.steampowered.com/app/${this.__id}`;
  }

  decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <SteamComponent
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        appID={this.__id}
      />
    );
  }
}

export function $createSteamNode(appID: string): SteamNode {
  return new SteamNode(appID);
}

export function $isSteamNode(
  node: SteamNode | LexicalNode | null | undefined
): node is SteamNode {
  return node instanceof SteamNode;
}
