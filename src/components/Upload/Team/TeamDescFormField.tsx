import EditorSkeleton from '@/components/Skeleton/EditorSkeleton';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { TeamPayload } from '@/lib/validators/team';
import { Prisma } from '@prisma/client';
import { LexicalEditor } from 'lexical';
import dynamic from 'next/dynamic';
import { FC, RefObject } from 'react';
import { UseFormReturn } from 'react-hook-form';

const MTEditor = dynamic(() => import('@/components/Editor/MoetruyenEditor'), {
  ssr: false,
  loading: () => <EditorSkeleton />,
});

interface TeamDescFormFieldProps {
  editorRef: RefObject<LexicalEditor>;
  form: UseFormReturn<TeamPayload>;
  initialContent?: Prisma.JsonValue;
}

const TeamDescFormField: FC<TeamDescFormFieldProps> = ({
  editorRef,
  form,
  initialContent,
}) => {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Mô tả</FormLabel>
          <FormMessage />
          <FormControl>
            <MTEditor
              placeholder="Nhập mô tả"
              editorRef={editorRef}
              initialContent={initialContent}
              onChange={(editorState) => field.onChange(editorState.toJSON())}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default TeamDescFormField;
