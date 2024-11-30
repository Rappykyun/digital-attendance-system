import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Admin } from "@/lib/database/models/Admin";
import { connectToDatabase } from "@/lib/database/connection";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          await connectToDatabase();
          
          const admin = await Admin.findOne({ email: credentials.email });
          if (!admin) {
            return null;
          }

          const isValid = await admin.comparePassword(credentials.password);
          if (!isValid) {
            return null;
          }

          return {
            id: admin._id,
            email: admin.email,
            name: admin.name,
            role: "admin"
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.userId;
      }
      return session;
    }
  },
  pages: {
    signIn: "/",
    signOut: "/",
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
