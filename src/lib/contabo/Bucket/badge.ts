import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadBadgeImage = async (image: File, prevImage: string | null) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('webp').webp({ quality: 40 });

  const { width, height } = await sharpImage.metadata();

  const optimizedImage = await resizeImage(
    sharpImage,
    width,
    height
  ).toBuffer();

  const command = new PutObjectCommand({
    Body: optimizedImage,
    Bucket: 'badge',
    Key: `${image.name}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/badge/${image.name}.webp`,
    prevImage
  );

  return Key;
};

export default UploadBadgeImage;
