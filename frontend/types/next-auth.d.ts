import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: "user" | "admin";
      apiToken: string;
    };
  }

  interface User {
    id: string;
    role: "user" | "admin";
    apiToken: string;
  }
}

declare module "next-auth/jwt" {
  interface Jwt {
    id: string;
    role: "user" | "admin";
    apiToken: string
  }
}