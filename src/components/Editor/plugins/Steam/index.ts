import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodeToNearestRoot } from '@lexical/utils';
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical';
import { useEffect } from 'react';
import { $createSteamNode, SteamNode } from '../../nodes/Steam';

export const INSERT_STEAM_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_STEAM_COMMAND'
);

export default function SteamPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([SteamNode])) {
      throw new Error('YouTubePlugin: YouTubeNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_STEAM_COMMAND,
      (payload) => {
        const steamNode = $createSteamNode(payload);
        $insertNodeToNearestRoot(steamNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
