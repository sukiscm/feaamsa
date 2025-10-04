// src/app/api/items/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const url = new URL(req.url);
  const qs = url.search; // conserva query params

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/items${qs}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const body = await req.text();

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}