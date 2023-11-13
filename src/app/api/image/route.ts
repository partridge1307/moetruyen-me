import { sleep } from '@/lib/utils';
import { zfd } from 'zod-form-data';

const WH_TOKEN: string[] = [
  'https://discord.com/api/webhooks/1163396589734330428/uqIvvrmSmEnbDoFb4jlzBESdzgoXbGLF3X3HfyGTUDbPgFoEFYD6LTHw541_dacDsWOj',
  'https://discord.com/api/webhooks/1163396618314321920/XgGl-EzNZ-JiEeC7JzX7-KMQoTqpuuPVGE2PdA2PS0vy8O564ZF2nOVbLvVbjLVL4WJq',
];

const sendImage = (image: File, start = 0, retry = 5): Promise<string> =>
  new Promise(async (resolve, reject) => {
    const form = new FormData();
    form.append('image', image);

    try {
      const response = await fetch(WH_TOKEN[start], {
        method: 'POST',
        body: form,
        redirect: 'follow',
      });

      if (response.status >= 400) throw new Error('Unknown error');

      const result = await response.json();

      return resolve(result.attachments[0].url);
    } catch (error) {
      await sleep(1);

      if (!!retry && retry > 0) {
        if (start === WH_TOKEN.length - 1) {
          return resolve(sendImage(image, 0, --retry));
        } else return resolve(sendImage(image, ++start, --retry));
      }

      return reject('ERROR');
    }
  });

const ImageFormValidator = zfd.formData({
  image: zfd
    .file()
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
      'Định dạng ảnh là png, jpg, jpeg'
    )
    .refine((file) => file.size < 2 * 1000 * 1000, 'Tối đa 2MB'),
});

export async function POST(req: Request) {
  try {
    const { image } = ImageFormValidator.parse(await req.formData());

    const url = await sendImage(image);

    return new Response(JSON.stringify({ url }));
  } catch (error) {
    return new Response('Something went wrong', { status: 500 });
  }
}
