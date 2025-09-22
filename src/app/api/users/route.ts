// app/api/users/route.ts - ejemplo de proxy server-side
import { auth } from "@/auth";

export async function GET() {
  const session = await auth(); // v5 server helper
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/users`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  return new Response(await r.text(), { status: r.status });
}
