import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadTeamImage = async (
  image: Blob,
  teamId: number,
  prevImage: string | null
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
    Bucket: 'team',
    Key: `${teamId}.webp`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/team/${teamId}.webp`,
    prevImage
  );

  return Key;
};

export default UploadTeamImage;
