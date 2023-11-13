import { Button } from '@/components/ui/Button';
import { FileArchive, PlusCircle, Trash } from 'lucide-react';
import { FC } from 'react';
import { AddImageTypeEnum } from './ChapterImageInput';

interface ChapterImageActionProps {
  hasImages: boolean;
  addImage: (type: keyof typeof AddImageTypeEnum) => void;
  clearImage: () => void;
  children: React.ReactNode;
}

const ChapterImageAction: FC<ChapterImageActionProps> = ({
  children,
  hasImages,
  addImage,
  clearImage,
}) => {
  return hasImages ? (
    <>
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="button"
          className="flex items-center justify-center gap-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addImage(AddImageTypeEnum.IMAGE);
          }}
        >
          <PlusCircle className="w-4 h-4" />
          Thêm ảnh
        </Button>
        <Button
          type="button"
          variant={'destructive'}
          className="flex items-center justify-center gap-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearImage();
          }}
        >
          <Trash className="w-4 h-4" />
          Xóa toàn bộ
        </Button>
      </div>

      <div className="max-sm:w-3/4 pt-6">{children}</div>
    </>
  ) : (
    <div className="flex flex-wrap items-center space-x-6">
      <Button
        type="button"
        className="space-x-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addImage(AddImageTypeEnum.IMAGE);
        }}
      >
        <PlusCircle className="w-5 h-5" />
        Thêm ảnh
      </Button>

      <Button
        type="button"
        className="space-x-2"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addImage(AddImageTypeEnum.COMPRESSED);
        }}
      >
        <FileArchive className="w-5 h-5" />
        Tải ảnh từ file nén
      </Button>
    </div>
  );
};

export default ChapterImageAction;
