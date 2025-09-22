// app/api/tickets/route.ts  (server)
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const qs = url.search; // conserva ?page=&limit=&status=...

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tickets${qs}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}
