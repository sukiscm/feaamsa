// src/app/api/material-requests/presets/stats/period/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    if (!startDate || !endDate) {
      return new Response(
        JSON.stringify({ message: 'Se requieren startDate y endDate' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/stats/period?startDate=${startDate}&endDate=${endDate}`,
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
    console.error('Error fetching period stats:', error);
    return new Response(
      JSON.stringify({ 
        message: error.message || 'Error al cargar estadísticas del periodo',
        data: []
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}