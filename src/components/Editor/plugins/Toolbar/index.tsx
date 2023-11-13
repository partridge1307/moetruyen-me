import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Input } from '@/components/ui/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { cn } from '@/lib/utils';
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  ListNode,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createQuoteNode } from '@lexical/rich-text';
import { $setBlocksType } from '@lexical/selection';
import {
  $findMatchingParent,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link as LinkIcon,
  ListChecks,
  Quote,
  Redo,
  Strikethrough,
  Underline,
  Undo,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ImageInputBody } from '../Image';
import { FloatingLinkEditor, getSelectedNode } from '../Link';

const lowPriority = 1;

const blockTypeToBlockName = {
  paragraph: 'Normal',
  quote: 'Quote',
  bullet: 'Bulleted List',
  check: 'Check List',
  number: 'Numbered List',
};

const alignType = {
  left: 'left',
  center: 'center',
  right: 'right',
  justify: 'justify',
};

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);
  const [selectedInlineStyle, setSelectedInlineStyle] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState<string>('');
  const [isLink, setIsLink] = useState<boolean>(false);
  const [isLinkDisabled, setIsLinkDisabled] = useState<boolean>(true);
  const [isDragging, setIsDragging] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const mouseCoords = useRef({
    startX: 0,
    scrollLeft: 0,
  });

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();

    let selectedInlineStyles = [...selectedInlineStyle];
    const updateInlineStyle = (selectedFormat: boolean, format: string) => {
      if (selectedFormat) {
        if (!selectedInlineStyles.includes(format))
          selectedInlineStyles.push(format);
        else return;
      } else {
        selectedInlineStyles = selectedInlineStyles.filter((s) => s !== format);
      }
    };

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : $findMatchingParent(anchorNode, (node) => {
              const parent = node.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDom = editor.getElementByKey(elementKey);

      updateInlineStyle(selection.hasFormat('bold'), 'bold');
      updateInlineStyle(selection.hasFormat('italic'), 'italic');
      updateInlineStyle(selection.hasFormat('underline'), 'underline');
      updateInlineStyle(selection.hasFormat('strikethrough'), 'strikethrough');

      setSelectedInlineStyle(selectedInlineStyles);

      selection.getTextContent() === ''
        ? setIsLinkDisabled(true)
        : setIsLinkDisabled(false);

      if (elementDom !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }

      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor, selectedInlineStyle]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => updateToolbar());
      }),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        lowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        lowPriority
      )
    );
  }, [editor, updateToolbar]);

  const insertLink = useCallback(
    (link: string) => {
      if (!isLink) {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, link);
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      }
    },
    [editor, isLink]
  );

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!toolbarRef.current) return;

    const startX = e.pageX - toolbarRef.current.offsetLeft;
    mouseCoords.current = { startX, scrollLeft: toolbarRef.current.scrollLeft };
    setIsDragging(true);
  }, []);
  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);
  const handleDragging = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !toolbarRef.current) return;
      e.preventDefault();

      const x = e.pageX - toolbarRef.current.offsetLeft;
      const walkX = (x - mouseCoords.current.startX) * 1.5;

      toolbarRef.current.scrollLeft = mouseCoords.current.scrollLeft - walkX;
    },
    [isDragging]
  );

  return (
    <div
      ref={toolbarRef}
      className="overflow-auto flex justify-between space-x-6 lg:gap-2 hide_scrollbar"
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
      onMouseMove={handleDragging}
    >
      <div
        className="flex items-center gap-2"
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
      >
        <div className="flex items-center gap-1">
          <button
            aria-label="bold format button"
            type="button"
            title="Ctrl + B"
            className={cn('p-1 rounded-md transition-colors', {
              'dark:bg-zinc-700': selectedInlineStyle.includes('bold'),
            })}
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
          >
            <Bold className="w-8 h-8 md:w-5 md:h-5" />
          </button>
          <button
            aria-label="italic format button"
            type="button"
            title="Ctrl + I"
            className={cn('p-1 rounded-md transition-colors', {
              'dark:bg-zinc-700': selectedInlineStyle.includes('italic'),
            })}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
          >
            <Italic className="w-8 h-8 md:w-5 md:h-5" />
          </button>
          <button
            aria-label="underline format button"
            type="button"
            title="Ctrl + U"
            className={cn('p-1 rounded-md transition-colors', {
              'dark:bg-zinc-700': selectedInlineStyle.includes('underline'),
            })}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
          >
            <Underline className="w-8 h-8 md:w-5 md:h-5" />
          </button>
          <button
            aria-label="strikethrough format button"
            type="button"
            className={cn('p-1 rounded-md transition-colors', {
              'dark:bg-zinc-700': selectedInlineStyle.includes('strikethrough'),
            })}
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
          >
            <Strikethrough className="w-8 h-8 md:w-5 md:h-5" />
          </button>
          {blockType in blockTypeToBlockName && (
            <>
              <button
                aria-label="list check format button"
                type="button"
                className={`p-1 rounded-md transition-colors ${
                  blockType === 'check' && 'dark:bg-zinc-700'
                }`}
                onClick={() => {
                  if (blockType !== 'check') {
                    editor.dispatchCommand(
                      INSERT_CHECK_LIST_COMMAND,
                      undefined
                    );
                  } else {
                    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
                  }
                }}
              >
                <ListChecks className="w-8 h-8 md:w-5 md:h-5" />
              </button>
              <button
                aria-label="quote format button"
                type="button"
                className={`p-1 rounded-md transition-colors ${
                  blockType === 'quote' && 'dark:bg-zinc-700'
                }`}
                onClick={() => {
                  if (blockType !== 'quote') {
                    editor.update(() => {
                      const selection = $getSelection();
                      if ($isRangeSelection(selection)) {
                        $setBlocksType(selection, () => $createQuoteNode());
                      }
                    });
                  }
                }}
              >
                <Quote className="w-8 h-8 md:w-5 md:h-5" />
              </button>
            </>
          )}
        </div>
        <Select
          defaultValue={'left'}
          onValueChange={(value) => {
            if (value in alignType) {
              editor.dispatchCommand(
                FORMAT_ELEMENT_COMMAND,
                value as keyof typeof alignType
              );
            }
          }}
        >
          <SelectTrigger
            aria-label="align button"
            type="button"
            className="max-sm:h-8 w-fit px-1 bg-transparent border-none focus:ring-transparent ring-offset-transparent"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent onCloseAutoFocus={() => editor.focus()}>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => e.preventDefault();
              }}
              value="left"
              className="cursor-pointer"
            >
              <AlignLeft className="w-8 h-8 md:w-5 md:h-5" />
            </SelectItem>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => e.preventDefault();
              }}
              value="center"
              className="cursor-pointer"
            >
              <AlignCenter className="w-8 h-8 md:w-5 md:h-5" />
            </SelectItem>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => e.preventDefault();
              }}
              value="right"
              className="cursor-pointer"
            >
              <AlignRight className="w-8 h-8 md:w-5 md:h-5" />
            </SelectItem>
            <SelectItem
              ref={(ref) => {
                if (!ref) return;
                ref.ontouchstart = (e) => e.preventDefault();
              }}
              value="justify"
              className="cursor-pointer"
            >
              <AlignJustify className="w-8 h-8 md:w-5 md:h-5" />
            </SelectItem>
          </SelectContent>
        </Select>

        <ImageInputBody editor={editor} />

        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="link insert button"
            type="button"
            className={cn(
              'p-1 transition-opacity',
              isLinkDisabled && 'opacity-50'
            )}
            disabled={isLinkDisabled}
          >
            <LinkIcon className="w-8 h-8 md:w-5 md:h-5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <div className="flex items-center p-1 gap-2">
              <Input
                placeholder="Điền Link..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
              />
              <DropdownMenuItem
                disabled={linkInput === ''}
                onClick={() => {
                  insertLink(linkInput);
                  setLinkInput('');
                }}
                className="dark:bg-white dark:text-black p-2"
              >
                Xong
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        {isLink &&
          createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
      </div>

      <div className="flex items-center gap-2 pr-2">
        <button
          aria-label="undo button"
          type="button"
          title="Ctrl + Z"
          disabled={!canUndo}
          className={cn('p-1 transition-opacity', !canUndo && 'opacity-50')}
          onClick={() => {
            editor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <Undo className="w-8 h-8 md:w-5 md:h-5" />
        </button>
        <button
          aria-label="redo button"
          type="button"
          disabled={!canRedo}
          className={cn('p-1 transition-opacity', !canRedo && 'opacity-50')}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <Redo className="w-8 h-8 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
