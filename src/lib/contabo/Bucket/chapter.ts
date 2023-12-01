import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  ListObjectsV2Command,
  ObjectCannedACL,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { ListObjects, generateKey, resizeImage, sendCommand } from '../utils';

const UploadChapterImage = async (
  images: File[],
  mangaId: number,
  chapterId: number
) => {
  const ImagePromises = images.map(async (img, index) => {
    const arrayBuffer = await new Blob([img]).arrayBuffer();
    const sharpImage = sharp(arrayBuffer)
      .toFormat('webp')
      .webp({ quality: 75 });

    const { width: originalWidth, height: originalHeight } =
      await sharpImage.metadata();

    const buffer = await resizeImage(
      sharpImage,
      originalWidth,
      originalHeight
    ).toBuffer();

    return {
      buffer,
      name: (++index).toString(),
    };
  });
  const optimizedImages = await Promise.all(ImagePromises);

  const promises = optimizedImages.map(async (image) => {
    await sendCommand(() =>
      contabo.send(
        new PutObjectCommand({
          Body: image.buffer,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${image.name}.webp`,
          ACL: ObjectCannedACL.public_read,
        })
      )
    );

    return `${process.env.NEXT_PUBLIC_IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${image.name}.webp`;
  });

  return await Promise.all(promises);
};

const makeTempImagesFolder = async (
  userImages: (string | File)[],
  dbImages: string[],
  mangaId: number,
  chapterId: number
) => {
  const listObjects = await ListObjects(`chapter/${mangaId}/${chapterId}/`);
  if (!listObjects.Contents?.length)
    userImages = userImages.filter((image) => image instanceof File);

  const keys = listObjects.Contents?.map((content) => content.Key);

  const promises = userImages.map(async (image, index) => {
    if (image instanceof File) {
      const arrayBuffer = await new Blob([image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 75 });

      const { width: originalWidth, height: originalHeight } =
        await sharpImage.metadata();
      const buffer = await resizeImage(
        sharpImage,
        originalWidth,
        originalHeight
      ).toBuffer();

      const command = new PutObjectCommand({
        Bucket: process.env.CB_BUCKET,
        Body: buffer,
        Key: `chapter/${mangaId}/NEW_${chapterId}/${++index}.webp`,
        ACL: ObjectCannedACL.public_read,
      });

      await sendCommand(() => contabo.send(command));

      const key = `${process.env.NEXT_PUBLIC_IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${index}.webp`;
      const existImage = dbImages.find((img) => img.startsWith(key));

      if (!existImage) return generateKey(key, null);
      else return generateKey(key, existImage);
    } else {
      const pathName = new URL(image).pathname;
      const extractedKey = pathName.match(/(\d+.webp)(?!.*\d)/g)?.[0];
      if (!extractedKey) return;

      const OLD_KEY = `chapter/${mangaId}/${chapterId}/${extractedKey}`;
      if (!keys?.includes(OLD_KEY)) return;

      const copyCommand = new CopyObjectCommand({
        Bucket: process.env.CB_BUCKET,
        CopySource: `${process.env.CB_BUCKET}/${OLD_KEY}`,
        Key: `chapter/${mangaId}/NEW_${chapterId}/${++index}.webp`,
        ACL: ObjectCannedACL.public_read,
      });

      await sendCommand(() => contabo.send(copyCommand));
      await sendCommand(() =>
        contabo.send(
          new DeleteObjectCommand({
            Bucket: process.env.CB_BUCKET,
            Key: OLD_KEY,
          })
        )
      );

      const key = `${process.env.NEXT_PUBLIC_IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${index}.webp`;
      const existImage = dbImages.find((img) => img.startsWith(key));

      if (!existImage) return generateKey(key, null);
      else return generateKey(key, existImage);
    }
  });

  return Promise.all(promises);
};

const copyBackAndRemoveTemp = async (mangaId: number, chapterId: number) => {
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.CB_BUCKET,
    Delimiter: '/',
    Prefix: `chapter/${mangaId}/NEW_${chapterId}/`,
  });
  const listImages = await sendCommand(() => contabo.send(listCommand));

  if (!listImages.Contents?.length) return;
  const keys = listImages.Contents.map((content) => content.Key).filter(
    Boolean
  ) as string[];

  const promises = keys.map(async (key) => {
    const extractedKey = key.match(/(\d+.webp)(?!.*\d)/g)?.[0];
    if (!extractedKey) return;

    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.CB_BUCKET,
      CopySource: `${process.env.CB_BUCKET}/${key}`,
      Key: `chapter/${mangaId}/${chapterId}/${extractedKey}`,
      ACL: ObjectCannedACL.public_read,
    });
    await sendCommand(() => contabo.send(copyCommand));
    await sendCommand(() =>
      contabo.send(
        new DeleteObjectCommand({
          Bucket: process.env.CB_BUCKET,
          Key: key,
        })
      )
    );
  });

  await Promise.all(promises);
};

const EditChapterImage = async (
  userImages: (string | File)[],
  dbImages: string[],
  mangaId: number,
  chapterId: number
) => {
  const results = await makeTempImagesFolder(
    userImages,
    dbImages,
    mangaId,
    chapterId
  );

  await DeleteChapterImages({ mangaId, chapterId });

  await copyBackAndRemoveTemp(mangaId, chapterId);

  return results.filter(Boolean) as string[];
};

const DeleteChapterImages = async ({
  mangaId,
  chapterId,
}: {
  mangaId: number;
  chapterId: number;
}) => {
  const listedObjects = await ListObjects(`chapter/${mangaId}/${chapterId}/`);
  if (!listedObjects.Contents?.length) return;

  const deleteInput: DeleteObjectsCommandInput = {
    Bucket: process.env.CB_BUCKET,
    Delete: {
      Objects: listedObjects.Contents.map(({ Key }) => ({ Key })),
    },
  };

  return await sendCommand(() =>
    contabo.send(new DeleteObjectsCommand(deleteInput))
  );
};

export { DeleteChapterImages, EditChapterImage, UploadChapterImage };
