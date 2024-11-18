import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/lib/database/models/User";
import clientPromise from "@/lib/database/connection";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import mongoose from "mongoose";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.email_verified) {
        console.log("Email not verified");
        return false;
      }

      try {
        if (mongoose.connection.readyState !== 1) {
          await mongoose.connect(process.env.MONGODB_URI);
        }

        let dbUser = await User.findOne({ email: profile.email });
        
        if (!dbUser) {
          dbUser = await User.create({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
            role: "student",
            registeredAt: new Date(),
          });
        }

        user.role = dbUser.role;
        user.id = dbUser._id.toString();
        
        return true;
      } catch (error) {
        console.error("Error during sign in:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
    signOut: "/",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST, authOptions };
