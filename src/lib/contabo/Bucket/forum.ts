import sharp from 'sharp';
import { generateKey, resizeImage, sendCommand } from '../utils';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { contabo } from '../client';

const UploadForumImage = async (
  image: File,
  subForumId: number,
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
    Bucket: 'forum',
    Key: `${subForumId}/thumbnail.jpg`,
  });

  await sendCommand(contabo, command, 5);

  const Key = generateKey(
    `${process.env.IMG_DOMAIN}/forum/${subForumId}/thumbnail.jpg`,
    prevImage
  );
  return Key;
};

const DeleteSubForumImage = async (subForumId: number) => {
  const command = new DeleteObjectCommand({
    Bucket: 'forum',
    Key: `${subForumId}/thumbnail.jpg`,
  });

  return await sendCommand(contabo, command, 5);
};

export { UploadForumImage, DeleteSubForumImage };
