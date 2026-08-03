import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        const [membership, portalAccess] = await Promise.all([
          prisma.membership.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "asc" },
          }),
          prisma.clientPortalAccess.findUnique({ where: { userId: user.id } }),
        ]);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          accountId: membership?.accountId,
          role: membership ? membership.role : portalAccess ? "CLIENT" : undefined,
          clientId: portalAccess?.clientId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.accountId = user.accountId;
        token.role = user.role;
        token.clientId = user.clientId;
      }

      if (trigger === "update" && token.sub) {
        const [membership, portalAccess] = await Promise.all([
          prisma.membership.findFirst({
            where: { userId: token.sub },
            orderBy: { createdAt: "asc" },
          }),
          prisma.clientPortalAccess.findUnique({ where: { userId: token.sub } }),
        ]);
        token.accountId = membership?.accountId;
        token.role = membership ? membership.role : portalAccess ? "CLIENT" : undefined;
        token.clientId = portalAccess?.clientId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.accountId = token.accountId;
        session.user.role = token.role;
        session.user.clientId = token.clientId;
      }
      return session;
    },
  },
});
