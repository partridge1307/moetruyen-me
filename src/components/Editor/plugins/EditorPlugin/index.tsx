'use client';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import type { LexicalEditor } from 'lexical';
import { FC, useEffect } from 'react';

interface EditorProps {
  editor: (editor: LexicalEditor) => void;
}

const Editor: FC<EditorProps> = ({ editor }): null => {
  const [lexicalEdtior] = useLexicalComposerContext();

  useEffect(() => {
    editor(lexicalEdtior);
  }, [editor, lexicalEdtior]);

  return null;
};

export default Editor;
