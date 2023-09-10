import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadMangaImage = async (
  image: Blob,
  mangaId: number,
  prevImage: string | null
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer)
    .toFormat('jpeg')
    .jpeg({ quality: 40, chromaSubsampling: '4:4:4', force: true });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'manga',
    Key: `${mangaId}/thumbnail.jpg`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/manga/${mangaId}/thumbnail.jpg`,
    prevImage
  );
  return Key;
};

export default UploadMangaImage;
