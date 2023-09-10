import { createTransport } from 'nodemailer';

export const transporter = createTransport({
  host: process.env.MAIL_HOST!,
  port: Number(process.env.MAIL_PORT!),
  secure: true,
  auth: {
    user: process.env.MAIL_USER!,
    pass: process.env.MAIL_PASS!,
  },
});

export const verifyMail = (token: string) => `<!DOCTYPE html>
<html lang="vi">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Xác thực</title>
    <style>
        *,
        body {
            margin: 0;
            font-family: 'Roboto', sans-serif;
            box-sizing: border-box;
        }

        ;
    </style>
</head>

<body>
    <main style="height: 100vh; width: 100vw; padding: 1rem; background: rgb(39 39 42); display: flex; flex-direction: column; justify-content: center; color: white">
        <div style="text-align: center;">
            <h1 style="font-weight: 600; color: #ffb44a;">MOETRUYEN</h1>
            <p style="margin-top: 0.5rem; font-size: 0.9rem">Cảm ơn bạn đã chọn Moetruyen</p>
        </div>

        <div style="margin-top: 5rem; text-align: center;">
            <p><span style="color: red;">*</span>Email này sẽ có hiệu lực trong 30p</p>
            <a href="${process.env.NEXTAUTH_URL}/verify?token=${token}"><button style="padding: 1rem; border-radius: 0.5rem; background: #ed8513; margin-top: 2rem">Nhấp tôi đi</button></a>
            <p style="font-size: 0.87rem; margin-top: 1.2rem">Bỏ qua nếu bạn không yêu cầu Mail này</p>
        </div>
    </main>
</body>

</html>`;

export const signInMail = (url: string) => `<!DOCTYPE html>
<html lang="vi">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Xác thực</title>
    <style>
        *,
        body {
            margin: 0;
            font-family: 'Roboto', sans-serif;
            box-sizing: border-box;
        }

        ;
    </style>
</head>

<body>
    <main style="height: 100vh; width: 100vw; padding: 1rem; background: rgb(39 39 42); display: flex; flex-direction: column; justify-content: center; color: white">
        <div style="text-align: center;">
            <h1 style="font-weight: 600; color: #ffb44a;">MOETRUYEN</h1>
            <p style="margin-top: 0.5rem; font-size: 0.9rem">Đăng nhập vô Moetruyen</p>
        </div>

        <div style="margin-top: 5rem; text-align: center;">
            <p><span style="color: red;">*</span>Email này sẽ có hiệu lực trong 1h</p>
            <a href="${url}"><button style="padding: 1rem; border-radius: 0.5rem; background: #ed8513; margin-top: 2rem">Nhấp tôi đi</button></a>
            <p style="font-size: 0.87rem; margin-top: 1.2rem">Bỏ qua nếu bạn không yêu cầu Mail này</p>
        </div>
    </main>
</body>

</html>`;

export const textSignInMail = (url: string) =>
  `Đăng nhập vô Moetruyen\n\n${url}\nBỏ qua nếu bạn không yêu cầu Mail này`;
export const textVerifyMai = (token: string) =>
  `Xác thực Moetruyen\n\nLink: ${process.env.NEXTAUTH_URL}/verify?token=${token}\nBỏ qua nếu bạn không yêu cầu Mail này`;
