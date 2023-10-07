import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const INPUT_ENCODING = 'utf-8';
const OUTPUT_ENCODING = 'hex';

export const encrypt = (key: string) => {
  const secretKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(ALGORITHM, secretKey, iv);

  const encryptedKey = Buffer.concat([
    cipher.update(Buffer.from(key, INPUT_ENCODING)),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return (
    encryptedKey.toString(OUTPUT_ENCODING) +
    '__' +
    tag.toString(OUTPUT_ENCODING) +
    '__' +
    secretKey.toString(OUTPUT_ENCODING) +
    '__' +
    iv.toString(OUTPUT_ENCODING)
  );
};

export const decrypt = (encryptedData: string) => {
  const [encryptedKey, tag, secretKey, iv] = encryptedData
    .split('__')
    .map((prop) => Buffer.from(prop, OUTPUT_ENCODING));

  const decipher = crypto.createDecipheriv(ALGORITHM, secretKey, iv);
  decipher.setAuthTag(tag);

  const decryptedKey = Buffer.concat([
    decipher.update(encryptedKey),
    decipher.final(),
  ]);

  return decryptedKey.toString(INPUT_ENCODING);
};
