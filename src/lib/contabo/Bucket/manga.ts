import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { generateKey, resizeImage, sendCommand } from '../utils';

const UploadMangaImage = async (
  image: Blob,
  mangaId: number,
  prevImage: string | null,
  type: 'thumbnail' | 'cover'
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  let sharpImage = sharp(arrayBuffer);
  sharpImage =
    type === 'thumbnail'
      ? sharpImage.toFormat('png').png({ quality: 40 })
      : sharpImage.toFormat('webp').webp({ quality: 75 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  await sendCommand(() =>
    contabo.send(
      new PutObjectCommand({
        Body: optimizedImage,
        Bucket: process.env.CB_BUCKET,
        Key: `manga/${mangaId}/${
          type === 'thumbnail' ? 'thumbnail.png' : 'cover.webp'
        }`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/manga/${mangaId}/${
      type === 'thumbnail' ? 'thumbnail.png' : 'cover.webp'
    }`,
    prevImage
  );
  return Key;
};

export default UploadMangaImage;
