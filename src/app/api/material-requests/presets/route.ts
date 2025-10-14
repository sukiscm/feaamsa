// src/app/api/material-requests/presets/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}