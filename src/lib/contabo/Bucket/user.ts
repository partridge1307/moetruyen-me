import { PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { contabo } from '../client';
import { generateKey, resizeImage, sendCommand } from '../utils';

const UploadUserImage = async (
  image: Blob,
  prevImage: string | null,
  userId: string,
  type: 'banner' | 'avatar'
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  const sharpImage = sharp(arrayBuffer).toFormat('png').png({ quality: 40 });

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
        Key: `user/${type}/${userId}.png`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/user/${type}/${userId}.png`,
    prevImage
  );

  return Key;
};

export default UploadUserImage;
