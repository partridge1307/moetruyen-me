import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import { Input } from '@/components/ui/Input';
import { ChapterUploadPayload } from '@/lib/validators/chapter';
import { FC } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ChapterVolumeFormFieldProps {
  form: UseFormReturn<ChapterUploadPayload>;
}

const ChapterVolumeFormField: FC<ChapterVolumeFormFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="volume"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Volume</FormLabel>
          <FormMessage />
          <FormControl>
            <Input type="number" min={0} {...field} />
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ChapterVolumeFormField;
