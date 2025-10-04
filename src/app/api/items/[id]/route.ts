// src/app/api/items/[id]/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/items/${id}`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.text();

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/items/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${access}`,
      "Content-Type": "application/json",
    },
    body,
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  const r = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/items/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });

  return new Response(await r.text(), { status: r.status });
}