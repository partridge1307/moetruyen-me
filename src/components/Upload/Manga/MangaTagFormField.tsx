import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Button } from '@/components/ui/Button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/Form';
import type { MangaUploadPayload, tagInfoProps } from '@/lib/validators/manga';
import { X } from 'lucide-react';
import { FC, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};

interface MangaTagFormProps {
  form: UseFormReturn<MangaUploadPayload>;
  tags: Tags[];
  existTags?: tagInfoProps[];
}

const MangaTagForm: FC<MangaTagFormProps> = ({ form, tags, existTags }) => {
  const [open, setOpen] = useState(false);
  const [tagsSelected, setTagsSelected] = useState<tagInfoProps[]>(
    existTags ?? []
  );

  return (
    <FormField
      control={form.control}
      name="tag"
      render={() => (
        <FormItem>
          <FormLabel>Thể loại</FormLabel>
          <FormMessage />
          <div className="w-full px-3 py-2 space-y-3 rounded-md border border-input text-sm bg-background">
            {!!tagsSelected.length && (
              <ul className="flex flex-wrap items-center gap-3">
                {tagsSelected.map((tag) => (
                  <li
                    key={tag.id}
                    className="flex items-center gap-2 pl-3 px-1 py-0.5 rounded-full bg-muted"
                  >
                    {tag.name}
                    <X
                      className="text-red-500"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();

                        const filteredTags = tagsSelected.filter(
                          (t) => t.id !== tag.id
                        );
                        setTagsSelected(filteredTags);
                        form.setValue('tag', filteredTags);
                      }}
                    />
                  </li>
                ))}
              </ul>
            )}

            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpen(true);
              }}
              className="text-muted-foreground"
            >
              Nhập thể loại
            </div>
          </div>
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogContent className="max-h-[100dvh] overflow-y-auto scrollbar dark:scrollbar--dark">
              <AlertDialogHeader>
                <AlertDialogTitle>Thêm/Xóa Tag Manga</AlertDialogTitle>
              </AlertDialogHeader>

              <div className="divide-y divide-primary/40">
                {tags.map((tag, index) => (
                  <div key={index} className="space-y-1 py-3">
                    <p className="text-xl font-semibold">{tag.category}</p>
                    <ul className="flex flex-wrap items-center gap-3">
                      {tag.data.map((childTag) => (
                        <li key={childTag.id} title={childTag.description}>
                          <Button
                            type="button"
                            size={'sm'}
                            variant={
                              tagsSelected.includes(childTag)
                                ? 'default'
                                : 'secondary'
                            }
                            aria-label={childTag.name}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              if (tagsSelected.includes(childTag)) {
                                const filteredTags = tagsSelected.filter(
                                  (tag) => tag.id !== childTag.id
                                );

                                setTagsSelected(filteredTags);
                                form.setValue('tag', filteredTags);
                              } else {
                                const addedTags = [...tagsSelected, childTag];

                                setTagsSelected(addedTags);
                                form.setValue('tag', addedTags);
                              }
                            }}
                          >
                            {childTag.name}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <AlertDialogFooter>
                <Button
                  type="button"
                  variant={'destructive'}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    setTagsSelected([]);
                    form.setValue('tag', []);
                    setOpen(false);
                  }}
                >
                  Reset
                </Button>
                <AlertDialogAction type="button">Xong</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </FormItem>
      )}
    />
  );
};

export default MangaTagForm;
