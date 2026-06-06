import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import sql from "@/lib/db";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      await sql`
        INSERT INTO users (email, name, image)
        VALUES (${user.email}, ${user.name}, ${user.image})
        ON CONFLICT (email) DO UPDATE
        SET name = EXCLUDED.name, image = EXCLUDED.image
      `;
      return true;
    },
    async session({ session }) {
      const [row] = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
      if (row) session.user.id = row.id;
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
