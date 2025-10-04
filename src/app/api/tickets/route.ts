// app/api/tickets/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tickets?${url.searchParams}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  const body = await r.text();
  return new NextResponse(body, { status: r.status });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const payload = await req.json();
  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/tickets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` },
    body: JSON.stringify(payload),
  });

  const body = await r.text();
  return new NextResponse(body, { status: r.status });
}
