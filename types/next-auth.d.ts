import type { DefaultSession } from "next-auth";

type AppRole = "OWNER" | "ADMIN" | "MEMBER" | "CLIENT";

declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      accountId?: string;
      role?: AppRole;
      clientId?: string;
    } & DefaultSession["user"];
  }

  interface User {
    accountId?: string;
    role?: AppRole;
    clientId?: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accountId?: string;
    role?: AppRole;
    clientId?: string;
  }
}
