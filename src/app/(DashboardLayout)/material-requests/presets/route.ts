// src/app/api/material-requests/presets/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets`,
      {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      }
    );

    if (!r.ok) {
      throw new Error(`Backend error: ${r.status}`);
    }

    return new Response(await r.text(), { 
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error fetching presets:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al cargar presets' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 👇 NUEVO: Para crear presets (admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.text();

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access}`,
          "Content-Type": "application/json",
        },
        body,
        cache: "no-store",
      }
    );

    return new Response(await r.text(), { 
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error creating preset:', error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al crear preset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}