import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { users, userProgress, skillProgress } from "@/db/schema";

const SINGLE_USER_ID = "vivekaditya";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Passphrase",
      credentials: {
        passphrase: { label: "Passphrase", type: "password" },
      },
      async authorize(credentials) {
        const passphrase = credentials?.passphrase as string;
        const expectedPassphrase = process.env.AUTH_PASSPHRASE;

        if (!expectedPassphrase) {
          console.error("AUTH_PASSPHRASE not set");
          return null;
        }

        if (passphrase !== expectedPassphrase) {
          return null;
        }

        const existingUser = await db.query.users.findFirst({
          where: eq(users.id, SINGLE_USER_ID),
        });

        if (!existingUser) {
          await db.insert(users).values({
            id: SINGLE_USER_ID,
          });

          await db.insert(userProgress).values({
            userId: SINGLE_USER_ID,
          });

          const skillTracks = [
            "coding",
            "system-design",
            "kubernetes",
            "cloud",
            "ai-infra",
            "behavioral",
          ] as const;

          for (const track of skillTracks) {
            await db.insert(skillProgress).values({
              userId: SINGLE_USER_ID,
              track,
            });
          }
        }

        return {
          id: SINGLE_USER_ID,
          name: "Vivekaditya",
          email: "vivekaditya@skillstreak.local",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  trustHost: true,
});

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function getUserId() {
  const user = await getCurrentUser();
  return user?.id;
}
