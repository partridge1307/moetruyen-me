import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { Input } from '@/components/ui/Input';
import { getMimeType } from '@/lib/utils';
import classes from '@/styles/mantine/dropzone.module.css';
import { Dropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.layer.css';
import { ArrowUpFromLine, CircleOff, Loader } from 'lucide-react';
import { UnrarError, createExtractorFromData } from 'node-unrar-js';
import {
  Dispatch,
  SetStateAction,
  forwardRef,
  useCallback,
  useState,
} from 'react';

export enum AddImageTypeEnum {
  IMAGE = 'IMAGE',
  COMPRESSED = 'COMPRESSED',
}

export enum ErrorEnum {
  PASSWORD_REQUIRED = 'PASSWORD_REQUIRED',
  WRONG_PASSWORD = 'WRONG_PASSWORD',
}

export type ImageType = {
  src: string;
  name: string;
};

export type RequiredPasswordType = {
  state: boolean;
  isWrongPass: boolean;
};

interface ChapterImageInputProps {
  type: keyof typeof AddImageTypeEnum;
  setType: Dispatch<SetStateAction<keyof typeof AddImageTypeEnum>>;
  setImages: Dispatch<SetStateAction<ImageType[]>>;
}

const ChapterImageInput = forwardRef<HTMLInputElement, ChapterImageInputProps>(
  ({ type, setType, setImages }, ref) => {
    const [files, setFiles] = useState<Omit<FileList, 'item'>>();
    const [password, setPassword] = useState('');
    const [isPasswordRequire, setIsPasswordRequire] =
      useState<RequiredPasswordType>({ state: false, isWrongPass: false });

    const onFileCommit = useCallback(
      (files: Omit<FileList, 'item'>) => {
        if (!files.length) return;

        if (type === 'IMAGE') {
          let arr: ImageType[] = [];
          for (let i = 0; i < files.length; ++i) {
            const file = files[i];
            if (file.size > 4 * 1000 * 1000) continue;

            arr.push({
              name: file.name,
              src: URL.createObjectURL(file),
            });
          }

          setImages((prev) => [...prev, ...arr]);
        } else {
          const file = files[0];

          if (file.type === 'application/zip') {
            ZipExtractor(file)
              .then((result) => !!result.length && setImages(result))
              .catch();
          }

          if (file.type === 'application/vnd.rar') {
            RarExtractor(file, password)
              .then((result) => !!result?.length && setImages(result))
              .catch((error) => {
                if (error instanceof Error) {
                  if (error.message === ErrorEnum.PASSWORD_REQUIRED)
                    setIsPasswordRequire({ state: true, isWrongPass: false });
                  if (error.message === ErrorEnum.WRONG_PASSWORD)
                    setIsPasswordRequire({ state: true, isWrongPass: true });
                }
              });
          }
        }
      },
      [password, setImages, type]
    );

    const onImageChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files?.length) return;

        const files = event.target.files;
        onFileCommit(files);
        setFiles(files);
        event.target.value = '';
      },
      [onFileCommit]
    );

    return (
      <div>
        <input
          ref={ref}
          type="file"
          multiple={type === 'IMAGE'}
          accept={
            type === 'IMAGE'
              ? 'image/jpg,image/png,image/jpeg'
              : 'application/zip,.rar'
          }
          className="hidden"
          onChange={onImageChange}
        />
        {isPasswordRequire.state && (
          <AlertDialog
            defaultOpen={isPasswordRequire.state}
            onOpenChange={(open) =>
              setIsPasswordRequire((prev) => ({
                state: open,
                isWrongPass: prev.isWrongPass,
              }))
            }
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {isPasswordRequire.isWrongPass ? 'Sai' : 'Yêu cầu'} mật khẩu
                </AlertDialogTitle>
                <AlertDialogDescription>
                  File nén của bạn yêu cầu mật khẩu
                </AlertDialogDescription>
              </AlertDialogHeader>

              <Input
                placeholder="Mật khẩu File của bạn"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => !!files?.length && onFileCommit(files)}
                >
                  Xác nhận
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        <Dropzone.FullScreen
          active
          multiple={type === 'IMAGE'}
          accept={[
            'image/png',
            'image/jpeg',
            'image/jpg',
            'application/zip',
            'application/vnd.rar',
          ]}
          classNames={classes}
          onDrop={(files) => {
            if (!files.length) return;

            const firstFile = files[0];

            if (
              firstFile.type === 'application/zip' ||
              firstFile.type === 'application/vnd.rar'
            ) {
              if (firstFile.size > 50 * 1000 * 1000) return;

              setType('COMPRESSED');
              setFiles(files);

              if (firstFile.type === 'application/zip') {
                ZipExtractor(firstFile)
                  .then((result) => !!result.length && setImages(result))
                  .catch();
              } else {
                RarExtractor(firstFile, '')
                  .then((result) => !!result?.length && setImages(result))
                  .catch((error) => {
                    if (error instanceof Error) {
                      if (error.message === ErrorEnum.PASSWORD_REQUIRED)
                        setIsPasswordRequire({
                          state: true,
                          isWrongPass: false,
                        });
                      if (error.message === ErrorEnum.WRONG_PASSWORD)
                        setIsPasswordRequire({
                          state: true,
                          isWrongPass: true,
                        });
                    }
                  });
              }
            } else {
              setType('IMAGE');

              let arr: ImageType[] = [];
              for (let i = 0; i < files.length; ++i) {
                const file = files[i];
                if (file.size > 4 * 1000 * 1000) continue;

                arr.push({
                  name: file.name,
                  src: URL.createObjectURL(file),
                });
              }

              setImages((prev) => [...prev, ...arr]);
            }
          }}
        >
          <Dropzone.Accept>
            <div className="flex items-center gap-2 dark:text-white">
              <ArrowUpFromLine className="w-6 h-6" />
              <p>Kéo File vào khu vực này</p>
            </div>
          </Dropzone.Accept>

          <Dropzone.Reject>
            <div className="flex items-center gap-2 text-red-500">
              <CircleOff className="w-6 h-6 text-red-500" />
              <p>File không hợp lệ</p>
            </div>
          </Dropzone.Reject>

          <Dropzone.Idle>
            <div className="flex items-center gap-2 dark:text-white">
              <Loader className="w-6 h-6 animate-spin" />
              <p>Đang nhận File</p>
            </div>
          </Dropzone.Idle>
        </Dropzone.FullScreen>
      </div>
    );
  }
);
ChapterImageInput.displayName = 'ChapterImageInput';

export default ChapterImageInput;

const RarExtractor = async (file: File, password: string) => {
  const [wasmBinary, fileBuffer] = await Promise.all([
    fetch(`/_next/static/public/unrar.wasm`, {
      credentials: 'same-origin',
      cache: 'force-cache',
    }),
    await file.arrayBuffer(),
  ]);
  if (!wasmBinary.ok || wasmBinary.status >= 300) return;

  try {
    const extractor = await createExtractorFromData({
      wasmBinary: await wasmBinary.arrayBuffer(),
      data: fileBuffer,
      password,
    });

    const { files } = extractor.extract({
      files: (fileHeader) => {
        return fileHeader.unpSize < 4 * 1000 * 1000;
      },
    });

    let arr: { src: string; name: string }[] = [];
    // @ts-ignore
    for (const f of files) {
      const type = getMimeType(f.extraction);

      if (['image/png', 'image/jpeg'].includes(type))
        arr.push({
          src: URL.createObjectURL(new Blob([f.extraction], { type })),
          name: f.fileHeader.name,
        });
    }

    return arr;
  } catch (error) {
    if (error instanceof UnrarError) {
      if (error.reason === 'ERAR_MISSING_PASSWORD')
        throw Error(ErrorEnum.PASSWORD_REQUIRED);
      if (error.reason === 'ERAR_BAD_PASSWORD')
        throw Error(ErrorEnum.WRONG_PASSWORD);
    }
  }
};

const ZipExtractor = async (file: File) => {
  const jszip = (await import('jszip')).default;

  try {
    const zippedFiles = Object.values((await jszip.loadAsync(file)).files);

    return (
      await Promise.all(
        zippedFiles
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map(async (zippedFile) => {
            const blob = await zippedFile.async('blob');
            if (blob.size > 4 * 1000 * 1000) return;

            return {
              src: URL.createObjectURL(
                new Blob([blob], {
                  type: `image/${zippedFile.name.split('.').pop() ?? 'jpeg'}`,
                })
              ),
              name: zippedFile.name,
            };
          })
      )
    ).filter(Boolean) as ImageType[];
  } catch (error) {
    throw error;
  }
};
