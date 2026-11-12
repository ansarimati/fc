import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import axios from "axios";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
              {
                email: credentials.email,
                password: credentials.password
              }
            );

            if (data.success) {
              return {
                id:      data.data.user._id,
                name:    data.data.user.name,
                email:   data.data.user.email,
                image:   data.data.user.avatar,
                role:    data.data.user.role,
                apiToken: data.data.token,
              }
            }
            return null;
        } catch (err: any) {
          throw new Error(
            err.response?.data?.message || "Invalid email or password"
          );
        }
      },

    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      // Sync google login with our backend to get JWT + create/link user
      if (account?.provider === "google") {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
            {
              email:    user.email,
              name:     user.name,
              avatar:   user.image,
              googleId: account.providerAccountId,
            }
          );
          if (data.success) {
            // Stash the backend JWT + role on the user object temporarily
            (user as any).apiToken = data.data.token;
            (user as any).role = data.data.role;
            (user as any).id = data.data.user_id;
            return true;
          }

          return false;
        }  catch (err: any) {
          return false;
        }
      }

      return true;
    },

    async jwt({ token , user }) {
      if (user) {
        token.id = (user as any).id;
        token.role     = (user as any).role;
        token.apiToken = (user as any).apiToken;
      }
      return token;
    },

    async session ({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id;
        (session.user as any).role     = token.role;
        (session.user as any).apiToken = token.apiToken;
      }
      return session;
    }
  },

  pages: {
    signIn: "/login",
    error: "/login"
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },

  secret: process.env.NEXTAUTH_SECRET,
}