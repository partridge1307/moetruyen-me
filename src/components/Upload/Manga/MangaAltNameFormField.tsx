import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { MangaUploadPayload } from '@/lib/validators/manga';
import '@/styles/mantine/globals.css';
import classes from '@/styles/mantine/tags-input.module.css';
import { TagsInput } from '@mantine/core';
import '@mantine/core/styles.layer.css';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface MangaAltNameFormFieldProps {
  form: UseFormReturn<MangaUploadPayload>;
}

const MangaAltNameFormField: FC<MangaAltNameFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="altName"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Tên khác (Nếu có)</FormLabel>
          <FormMessage />
          <FormControl>
            <TagsInput
              ref={field.ref}
              placeholder="Tên khác"
              classNames={classes}
              clearable
              value={field.value}
              onChange={(values) => field.onChange(values)}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default MangaAltNameFormField;
