import { AuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectToDatabase } from "@/lib/db";
import { User } from "@/models/user";
import { generateToken, generateTokenExpiry, isTokenExpired } from "@/utils/token";
import { sendEmail } from "@/lib/mailer";
import { emailVerificationTemplate } from "@/templates/emailVerification";
import type { DefaultUser } from "next-auth";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface ExtendedUser extends DefaultUser {
  id: string;
  role: string;
}

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        await connectToDatabase();

        const { identifier, password } = credentials ?? {};
        if (!identifier || !password) {
          throw new Error("Missing credentials");
        }

        const user = await User.findOne({
          $or: [{ email: identifier }, { username: identifier }],
        });

        if (!user) {
          throw new Error("Invalid email/username or password");
        }

        if (!user.emailVerified) {
          const tokenIsExpired =
            !user.verificationToken ||
            !user.verificationTokenExpiry ||
            isTokenExpired(user.verificationTokenExpiry);

          if (tokenIsExpired) {
            const newToken = generateToken();
            const newExpiry = generateTokenExpiry(5); // 5 minutes

            user.verificationToken = newToken;
            user.verificationTokenExpiry = newExpiry;
            user.verificationTokenPurpose = "signup";

            await user.save();

            const verifyUrl = `${process.env.NEXTAUTH_URL}/verify?token=${newToken}&email=${encodeURIComponent(user.email)}`;

            try {
              await sendEmail({
                to: user.email,
                subject: "Verify your email",
                html: emailVerificationTemplate(user.username || user.email, verifyUrl),
              });
            } catch (err) {
              console.error("Failed to send verification email:", err);
            }
          }

          throw new Error("Please verify your email. We've sent you a new verification link.");
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
          throw new Error("Invalid email/username or password");
        }

        return {
          id: user._id.toString(),
          name: user.fullName,
          email: user.email,
          role: user.role,
        } as AuthUser;
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as AuthUser;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.email = token.email ?? null;
        session.user.name = token.name ?? null;
        session.user.role = token.role ?? null;
      }
      return session;
    },

    async signIn({ user, account }) {
      await connectToDatabase();

      // ✅ GitHub login - ensure user is created or marked verified
      if (account?.provider === "github") {
        const email = user.email;
        if (!email) return false;

        let dbUser = await User.findOne({ email });

        if (!dbUser) {
          const username = email.split("@")[0] || `github_${Date.now()}`;

          dbUser = await User.create({
            fullName: user.name || username,
            email,
            username,
            password: Math.random().toString(36).slice(-8),
            role: "user",
            emailVerified: true,
          });
        } else if (!dbUser.emailVerified) {
          dbUser.emailVerified = true;
          await dbUser.save();
        }

        const extendedUser = user as ExtendedUser;
        extendedUser.role = dbUser.role;
        extendedUser.id = dbUser._id.toString();
      }

      return true;
    },
  },
};