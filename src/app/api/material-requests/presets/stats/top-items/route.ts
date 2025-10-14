// src/app/api/material-requests/presets/stats/top-items/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit') || '10';

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/stats/top-items?limit=${limit}`,
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
    console.error('Error fetching top items:', error);
    return new Response(
      JSON.stringify({ 
        message: error.message || 'Error al cargar items populares',
        data: []
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}