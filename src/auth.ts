// src/lib/auth.ts
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const BACK_URL = process.env.NEXT_PUBLIC_BACK_URL ?? "https://beaamsa-production.up.railway.app/api";

// Llama a tu Nest para login
async function loginRequest(email: string, password: string) {
  const r = await fetch(`${BACK_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!r.ok) throw new Error("Credenciales inválidas");
  return (await r.json()) as { access_token: string; refresh_token: string };
}

// Llama a tu Nest para refresh
async function refreshAccessToken(refresh_token: string) {
  const r = await fetch(`${BACK_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token }),
  });
  if (!r.ok) throw new Error("Refresh inválido");
  return (await r.json()) as { access_token: string };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { access_token, refresh_token } = await loginRequest(
          credentials.email,
          credentials.password
        );
        // Puedes traer más datos del back si los expones (id, roles, etc.)
        return {
          id: "me",
          email: credentials.email,
          accessToken: access_token,
          refreshToken: refresh_token,
          accessExpiresAt: Date.now() + 15 * 60 * 1000, // ajusta al TTL real de tu access
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/authentication/login",     // ajusta a tu ruta de login
    error: "/auth/error", // opcional
  },
  session: { strategy: "jwt" },

  callbacks: {
    // Corre en sign-in y en cada request
    async jwt({ token, user }) {
      // Sign-in: copiar datos del "user" (de authorize) a token
      if (user) {
        const u = user as any;
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessExpiresAt = u.accessExpiresAt ?? Date.now() + 15 * 60 * 1000;
        token.email = u.email ?? token.email;
        token.id = u.id ?? token.id;
        return token;
      }

      // Si access vigente, continúa
      if (token.accessExpiresAt && Date.now() < (token.accessExpiresAt as number)) {
        return token;
      }

      // Si expiró y hay refresh, intenta renovarlo contra tu Nest
      if (token.refreshToken) {
        try {
          const { access_token } = await refreshAccessToken(token.refreshToken as string);
          token.accessToken = access_token;
          token.accessExpiresAt = Date.now() + 15 * 60 * 1000; // ajusta a tu TTL real
          return token;
        } catch {
          // Refresh falló → limpiar para forzar re-login
          delete token.accessToken;
          delete token.refreshToken;
          delete token.accessExpiresAt;
          return token;
        }
      }

      return token;
    },

    // Lo que expones al cliente con useSession()
    async session({ session, token }) {
      (session as any).access_token = token.accessToken ?? null;
      session.user = {
        id: (token as any).id ?? null,
        email: session.user?.email ?? (token as any).email ?? null,
        // roles: (token as any).roles ?? [], // si luego los agregas
      };
      return session;
    },
  },
};
