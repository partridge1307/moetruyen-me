import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { type AuthOptions, getServerSession } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Discord from 'next-auth/providers/discord';
import Email from 'next-auth/providers/email';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
import { signInMail, textSignInMail, transporter } from './mail';
import { generateRandomName } from './uniqueName';
import { AuthSignInValidator } from './validators/auth';

export interface AuthContext {
  params: { nextauth: string[] };
}

const HOST_URL = new URL(process.env.NEXTAUTH_URL!);
const useSecureCookies = HOST_URL.protocol.startsWith('https');

export const authOptionsWrapper = (
  request: NextRequest,
  context: AuthContext
) => {
  const { params } = context;

  const isCredentialsCallback =
    params?.nextauth?.includes('callback') &&
    params.nextauth.includes('credentials') &&
    request.method === 'POST';

  return [
    request,
    context,
    {
      adapter: PrismaAdapter(db),
      pages: {
        signIn: '/sign-in',
        error: '/auth-error',
        verifyRequest: '/verify-request',
      },
      session: { strategy: 'database' },
      secret: process.env.NEXTAUTH_SECRET,
      providers: [
        Credentials({
          name: 'Credentials',
          credentials: {
            email: { label: 'Email', type: 'email' },
            password: { label: 'Password', type: 'password' },
          },
          authorize: async (credentials) => {
            try {
              const { email, password } =
                AuthSignInValidator.parse(credentials);

              const userExists = await db.user.findFirstOrThrow({
                where: {
                  email,
                },
                select: {
                  id: true,
                  name: true,
                  image: true,
                  banner: true,
                  color: true,
                  password: true,
                  muteExpires: true,
                  isBanned: true,
                },
              });

              if (await bcrypt.compare(password, userExists.password)) {
                return {
                  id: userExists.id,
                  name: userExists.name,
                  image: userExists.image,
                  banner: userExists.banner,
                  color: userExists.color as
                    | { color: string }
                    | { from: string; to: string }
                    | null,
                  muteExpires: userExists.muteExpires,
                  isBanned: userExists.isBanned,
                };
              } else throw Error();
            } catch (error) {
              return null;
            }
          },
        }),
        Email({
          server: {
            host: process.env.MAIL_HOST,
            port: Number(process.env.MAIL_PORT),
            auth: {
              user: process.env.MAIL_USER,
              pass: process.env.MAIL_PASS,
            },
          },
          from: `Moetruyen<${process.env.MAIL_USER}>`,
          maxAge: 1 * 60 * 60,
          sendVerificationRequest: async ({ identifier, url, provider }) => {
            const result = await transporter.sendMail({
              to: identifier,
              from: provider.from,
              subject: 'Đăng nhập',
              html: signInMail(url),
              text: textSignInMail(url),
            });

            const failed = result.rejected
              .concat(result.pending)
              .filter(Boolean);
            if (failed.length) {
              throw new Error(`Không thể gửi Email: (${failed.join(', ')})`);
            }
          },
        }),
        Discord({
          clientId: process.env.DISC_CLIENT_ID!,
          clientSecret: process.env.DISC_CLIENT_SECRET!,
          authorization: { params: { scope: 'identify' } },
        }),
      ],
      cookies: {
        sessionToken: {
          name: `${useSecureCookies ? `__Secure-` : ''}next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            domain:
              HOST_URL.hostname === 'localhost'
                ? HOST_URL.hostname
                : `.moetruyen.net`,
            secure: useSecureCookies,
          },
        },
      },
      callbacks: {
        async signIn({ user, account }) {
          if (user) {
            if (isCredentialsCallback) {
              const sessionToken = randomUUID();
              const sessionExpiry = new Date(
                Date.now() + 15 * 24 * 60 * 60 * 1000
              );

              await db.session.create({
                data: {
                  sessionToken,
                  userId: user.id,
                  expires: sessionExpiry,
                },
              });

              cookies().set(
                `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`,
                sessionToken,
                {
                  expires: sessionExpiry,
                  httpOnly: true,
                  sameSite: 'lax',
                  domain:
                    HOST_URL.hostname === 'localhost'
                      ? HOST_URL.hostname
                      : `.moetruyen.net`,
                  secure: useSecureCookies,
                }
              );

              return true;
            } else {
              if (account?.provider === 'email') {
                const userExist = await db.user.findUnique({
                  where: {
                    id: user.id,
                  },
                });

                if (userExist) return true;
              } else if (account?.provider === 'discord') {
                const existAccount = await db.user.findUnique({
                  where: {
                    id: user.id,
                    account: {
                      some: {
                        provider: 'discord',
                      },
                    },
                  },
                  select: {
                    id: true,
                  },
                });
                if (existAccount) {
                  await db.account.deleteMany({
                    where: {
                      userId: existAccount.id,
                    },
                  });
                }

                return true;
              }

              return false;
            }
          } else return false;
        },
        session: async ({ session, user: dbUser }) => {
          const { expires } = session;

          if (dbUser.isBanned) {
            return null;
          } else if (
            dbUser.muteExpires &&
            new Date(dbUser.muteExpires).getTime() > Date.now()
          ) {
            return null;
          }

          if (!dbUser.name) {
            const updatedUser = await db.user.update({
              where: {
                id: dbUser.id,
              },
              data: {
                name: generateRandomName,
              },
            });

            return {
              user: {
                id: updatedUser.id,
                name: updatedUser.name,
                image: updatedUser.image,
                banner: updatedUser.banner,
                color: updatedUser.color,
              },
              expires,
            };
          }

          return {
            user: {
              id: dbUser.id,
              name: dbUser.name,
              image: dbUser.image,
              banner: dbUser.banner,
              color: dbUser.color,
            },
            expires,
          };
        },
      },
      jwt: {
        maxAge: 15 * 24 * 60 * 60,
        encode: async (arg) => {
          if (isCredentialsCallback) {
            const cookie = cookies().get(
              `${useSecureCookies ? '__Secure-' : ''}next-auth.session-token`
            );

            if (cookie) return cookie.value;
            return '';
          }

          return encode(arg);
        },
        decode: async (arg) => {
          if (isCredentialsCallback) {
            return null;
          }
          return decode(arg);
        },
      },
      events: {
        signOut: async ({ session }) => {
          const { sessionToken = '' } = session as unknown as {
            sessionToken?: string;
          };

          if (sessionToken) {
            await db.session.deleteMany({
              where: {
                sessionToken,
              },
            });
          }
        },
      },
    } as AuthOptions,
  ] as const;
};

export const getAuthSession = () =>
  getServerSession(
    authOptionsWrapper(
      // @ts-ignore
      { cookies: cookies(), headers: headers() },
      { params: { nextauth: ['session'] } }
    )[2]
  );

// export const getAuthSession = () =>
//   getSession({ req: { headers: Object.fromEntries(headers().entries()) } });
