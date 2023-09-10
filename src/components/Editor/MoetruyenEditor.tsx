'use client';

import '@/styles/mteditor.css';
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';
import {
  LexicalComposer,
  type InitialConfigType,
} from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import type { Prisma } from '@prisma/client';
import type { EditorState, LexicalEditor } from 'lexical';
import { nodes } from './Node';
import { theme } from './Theme';
import AutoEmbedPlugin from './plugins/AutoEmbed';
import AutoLink from './plugins/AutoLink';
import EditorPlugin from './plugins/EditorPlugin';
import ImagesPlugin from './plugins/Image';
import MaxLengthPlugin from './plugins/MaxLength';
import Toolbar from './plugins/Toolbar';
import YouTubePlugin from './plugins/Youtube';
import SteamPlugin from './plugins/Steam';
import MentionsPlugin from './plugins/Mention';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';

function onError(error: Error): void {
  // eslint-disable-next-line no-console
  console.log(error);
}

const editorConfig: InitialConfigType = {
  namespace: 'MoetruyenEditor',
  theme,
  onError,
  nodes: [...nodes],
};

const Editor = ({
  placeholder = 'Nói lên cảm nghĩ của bạn...',
  maxLength = 1024,
  initialContent,
  editor,
  onChange,
}: {
  placeholder?: string;
  maxLength?: number;
  initialContent?: JSON | Prisma.JsonValue;
  // eslint-disable-next-line no-unused-vars
  editor?: (editor: LexicalEditor) => void;
  // eslint-disable-next-line no-unused-vars
  onChange?: (editorState: EditorState) => void;
}): JSX.Element => {
  return (
    <LexicalComposer
      initialConfig={
        initialContent
          ? { editorState: JSON.stringify(initialContent), ...editorConfig }
          : editorConfig
      }
    >
      <Toolbar />
      <div className="moetruyen-editor-inner">
        <RichTextPlugin
          contentEditable={
            <ContentEditable className="moetruyen-editor-input bg-background rounded-lg focus:ring-1 focus-visible:ring-offset-1" />
          }
          placeholder={
            <div className="moetruyen-placeholder text-muted-foreground">
              {placeholder}
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
      </div>
      <div className="text-right">
        <CharacterLimitPlugin charset="UTF-8" maxLength={maxLength} />
      </div>

      <AutoLink />
      <AutoEmbedPlugin />
      <ClearEditorPlugin />
      <CheckListPlugin />
      <HistoryPlugin />
      <LinkPlugin />
      <MaxLengthPlugin maxLength={maxLength} />
      <MentionsPlugin />
      <ImagesPlugin />
      <SteamPlugin />
      <YouTubePlugin />
      <OnChangePlugin
        onChange={(editorState) => !!onChange && onChange(editorState)}
      />
      <EditorPlugin
        editor={(lexicalEditor) => !!editor && editor(lexicalEditor)}
      />
    </LexicalComposer>
  );
};

export default Editor;
