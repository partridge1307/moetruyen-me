import { PrismaAdapter } from '@auth/prisma-adapter';
import { randomUUID } from 'crypto';
import { getServerSession, type AuthOptions } from 'next-auth';
import { decode, encode } from 'next-auth/jwt';
import Discord from 'next-auth/providers/discord';
import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { db } from './db';
import { setRandomUsername } from './uniqueName';

export interface AuthContext {
  params: { nextauth: string[] };
}

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
        signIn: `${process.env.MAIN_URL}/sign-in`,
        error: `${process.env.MAIN_URL}/auth-error`,
        verifyRequest: `${process.env.MAIN_URL}/verify-request`,
      },
      session: { strategy: 'database' },
      secret: process.env.NEXTAUTH_SECRET,
      providers: [
        Discord({
          clientId: process.env.DISC_CLIENT_ID!,
          clientSecret: process.env.DISC_CLIENT_SECRET!,
          authorization: { params: { scope: 'identify' } },
        }),
      ],
      cookies: {
        sessionToken: {
          name: `${
            process.env.NODE_ENV === 'production' ? `__Secure-` : ''
          }next-auth.session-token`,
          options: {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            domain:
              process.env.NODE_ENV === 'production'
                ? 'moetruyen.net'
                : 'localhost',
            secure: process.env.NODE_ENV === 'production',
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
                `${
                  process.env.NODE_ENV === 'production' ? `__Secure-` : ''
                }next-auth.session-token`,
                sessionToken,
                {
                  expires: sessionExpiry,
                  httpOnly: true,
                  sameSite: 'lax',
                  domain:
                    process.env.NODE_ENV === 'production'
                      ? 'moetruyen.net'
                      : 'localhost',
                  secure: process.env.NODE_ENV === 'production',
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
            const updatedUser = await setRandomUsername(dbUser.id);

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
              `${
                process.env.NODE_ENV === 'production' ? `__Secure-` : ''
              }next-auth.session-token`
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
