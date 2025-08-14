import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { prisma } from "@/lib/prisma"
// import bcrypt from "bcryptjs"

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: string
      image?: string | null
    }
  }
  
  interface User {
    id: string
    email: string
    name?: string | null
    role: string
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
  }
}

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("🔐 Mock auth attempt:", credentials?.email)
        
        // Simple mock authentication for testing
        if (credentials?.email === "test@example.com" && credentials?.password === "password") {
          console.log("✅ Mock auth successful for:", credentials.email)
          return {
            id: "mock-user-id",
            email: credentials.email,
            name: "Test User",
            role: "admin",
            image: null,
          }
        }
        
        console.log("❌ Mock auth failed")
        return null
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role
        session.user.id = token.id
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin",
  },
  debug: process.env.NODE_ENV === "development",
} 