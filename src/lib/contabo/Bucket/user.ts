import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadUserImage = async (
  image: Blob,
  prevImage: string | null,
  userId: string,
  type: 'banner' | 'avatar'
) => {
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
    Bucket: 'user',
    Key: `${type}/${userId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/user/${type}/${userId}.webp`,
    prevImage
  );

  return Key;
};

export default UploadUserImage;
