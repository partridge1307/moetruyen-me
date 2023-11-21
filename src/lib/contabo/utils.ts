import type sharp from 'sharp';
import { sleep } from '../utils';
import { ListObjectsV2Command } from '@aws-sdk/client-s3';
import { contabo } from './client';

const sendCommand = async <T>(
  func: () => Promise<T>,
  retry = 5
): Promise<T> => {
  try {
    return await func();
  } catch (error) {
    if (retry || retry > 0) {
      await sleep(1.5);

      return await sendCommand(func, retry - 1);
    } else throw error;
  }
};

const resizeImage = (
  image: sharp.Sharp,
  originalWidth?: number,
  originalHeight?: number
) => {
  let optimizedImage;
  if (originalWidth && originalHeight) {
    if (originalWidth < originalHeight) {
      originalWidth > 1100
        ? (optimizedImage = image.resize(1100))
        : (optimizedImage = image);
    } else {
      originalWidth > 1600
        ? (optimizedImage = image.resize(1600))
        : (optimizedImage = image);
    }
  } else {
    optimizedImage = image;
  }

  return optimizedImage;
};

const generateKey = (key: string, prevImage: string | null) => {
  if (!prevImage) return key;

  const idParam = new URL(prevImage).searchParams.get('id');

  if (!idParam) return `${key}?id=1`;
  return `${key}?id=${Number(idParam) + 1}`;
};

const ListObjects = (key: string) => {
  const command = new ListObjectsV2Command({
    Bucket: process.env.CB_BUCKET,
    Delimiter: '/',
    Prefix: key,
  });
  return contabo.send(command);
};

export { generateKey, ListObjects, resizeImage, sendCommand };
