import {
  NumberDictionary,
  type Config,
  uniqueNamesGenerator,
} from 'unique-names-generator';
import { db } from './db';
import type { User } from '@prisma/client';

const CatNames = [
  'MoeMongMo',
  'MoeBietTuot',
  'MoeDiHia',
  'MoeBayBong',
  'MoeBienThai',
  'MoeTangDong',
  'MoeHipHop',
  'MoeLuoiNhat',
  'MoeNhayNhot',
  'MoeFlexing',
  'MoePressing',
  'MoeMoeMoe',
  'MoeSimpMy',
  'MoeNguoc',
  'BLVAnhMoe',
  'MoeItalia',
  'MoeVOZER',
  'MoeThoNgoc',
  'MoeHutCan',
  'MoeTeNan',
  'MoeNghien',
  'MeoPayLak',
  'MoeVuiVe',
  'MoeNgocNghech',
];

const numberDictionary = NumberDictionary.generate({ min: 1, max: 99999 });

const customConfig: Config = {
  dictionaries: [CatNames, numberDictionary],
  separator: '',
  length: 2,
};

export const setRandomUsername = async (userId: string): Promise<User> => {
  const randomName = uniqueNamesGenerator(customConfig);

  const isExisted = await db.user.findUnique({
    where: {
      name: randomName,
    },
    select: {
      id: true,
    },
  });

  if (isExisted) return setRandomUsername(userId);
  else
    return db.user.update({
      where: {
        id: userId,
      },
      data: {
        name: randomName,
      },
    });
};
