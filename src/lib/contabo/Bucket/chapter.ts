import {
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { generateKey, generateName, resizeImage, sendCommand } from '../utils';

const UploadChapterImage = async (
  images: Blob[],
  mangaId: number,
  chapterId: number
) => {
  const optimizedImages = await Promise.all(
    images.map(async (img) => {
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
        name: img.name.split('.').shift(),
      };
    })
  );

  const imagesLink = await Promise.all(
    optimizedImages.map(async (image) => {
      await sendCommand(() =>
        contabo.send(
          new PutObjectCommand({
            Body: image.buffer,
            Bucket: process.env.CB_BUCKET,
            Key: `chapter/${mangaId}/${chapterId}/${image.name}.webp`,
          })
        )
      );

      return `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${image.name}.webp`;
    })
  );

  return imagesLink;
};

const EditChapterImage = async (
  newImages: (Blob | string)[],
  existingImages: string[],
  mangaId: number,
  chapterId: number
) => {
  const serializedNewImages = newImages.map((image, index) => ({
      index,
      image,
    })),
    serializedExistImages = existingImages.map((image, index) => ({
      index,
      image,
    }));

  const blobImages = serializedNewImages.filter(
      (image) => image.image instanceof File
    ) as {
      index: number;
      image: File;
    }[],
    linkImages = serializedNewImages.filter(
      (image) => typeof image.image === 'string'
    ) as {
      index: number;
      image: string;
    }[],
    deletedImages = serializedExistImages.filter(
      (img) => !linkImages.some((image) => image.image === img.image)
    );

  const blobImagesHandler = await Promise.all(
    blobImages.map(async ({ image, index }) => {
      const arrayBuffer = await new Blob([image]).arrayBuffer();
      const sharpImage = sharp(arrayBuffer)
        .toFormat('webp')
        .webp({ quality: 75 });

      const { width, height } = await sharpImage.metadata();

      const optimizedImage = await resizeImage(
        sharpImage,
        width,
        height
      ).toBuffer();

      const key = `${
        process.env.IMG_DOMAIN
      }/chapter/${mangaId}/${chapterId}/${image.name.split('.').shift()}.webp`;

      let command, generatedKey;

      const existImage = serializedExistImages.find(
        (exist) => exist.index === index && exist.image.startsWith(key)
      );
      if (existImage) {
        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${image.name
            .split('.')
            .shift()}.webp`,
        });

        generatedKey = generateKey(
          `${
            process.env.IMG_DOMAIN
          }/chapter/${mangaId}/${chapterId}/${image.name
            .split('.')
            .shift()}.webp`,
          existImage.image
        );
      } else {
        const name = image.name.split('.').shift()!;
        const newName = generateName(
          name,
          existingImages,
          Number(name.split('_').pop()),
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}`
        );

        command = new PutObjectCommand({
          Body: optimizedImage,
          Bucket: process.env.CB_BUCKET,
          Key: `chapter/${mangaId}/${chapterId}/${newName}.webp`,
        });

        generatedKey = generateKey(
          `${process.env.IMG_DOMAIN}/chapter/${mangaId}/${chapterId}/${newName}.webp`,
          null
        );
      }

      return {
        index: index,
        image: generatedKey,
        command: command,
      };
    })
  );

  const uploadedNewImages = await Promise.all(
    blobImagesHandler.map(async (blobImage) => {
      await sendCommand(() => contabo.send(blobImage.command));

      return { index: blobImage.index, image: blobImage.image };
    })
  );

  const deleteInput: DeleteObjectsCommandInput = {
    Bucket: process.env.CB_BUCKET,
    Delete: {
      Objects: deletedImages.map((deleteImage) => {
        const image = new URL(deleteImage.image).pathname.split('/').pop();

        return { Key: `chapter/${mangaId}/${chapterId}/${image}` };
      }),
    },
  };

  await sendCommand(() => contabo.send(new DeleteObjectsCommand(deleteInput)));

  return [...linkImages, ...uploadedNewImages];
};

const DeleteChapterImages = async ({
  mangaId,
  chapterId,
}: {
  mangaId: number;
  chapterId: number;
}) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.CB_BUCKET,
    Delimiter: '/',
    Prefix: `chapter/${mangaId}/${chapterId}/`,
  });

  const listedObjects = await contabo.send(command);
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

export { EditChapterImage, UploadChapterImage, DeleteChapterImages };
