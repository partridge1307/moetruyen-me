import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadTeamImage = async (
  image: Blob,
  teamId: number,
  prevImage: string | null,
  type: 'image' | 'cover'
) => {
  const arrayBuffer = await new Blob([image]).arrayBuffer();
  let sharpImage = sharp(arrayBuffer);
  sharpImage =
    type === 'image'
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
        Key: `team/${teamId}/${type === 'image' ? 'image.png' : 'cover.png'}`,
      })
    )
  );

  const Key = generateKey(
    `${process.env.NEXT_PUBLIC_IMG_DOMAIN}/team/${teamId}/${
      type === 'image' ? 'image.png' : 'cover.png'
    }`,
    prevImage
  );

  return Key;
};

export default UploadTeamImage;
