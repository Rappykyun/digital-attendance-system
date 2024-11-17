import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/database/connection";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.email.endsWith("@sksu.edu.ph") ? "student" : "admin",
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      session.user.role = user.role;
      session.user.id = user.id;
      return session;
    },
  },
  adapter: MongoDBAdapter(clientPromise),
});

export { handler as GET, handler as POST };
