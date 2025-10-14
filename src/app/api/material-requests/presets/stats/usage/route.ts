// src/app/api/material-requests/presets/stats/usage/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/stats/usage`,
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
    console.error('Error fetching preset stats:', error);
    return new Response(
      JSON.stringify({ 
        message: error.message || 'Error al cargar estadísticas',
        presetsWithStats: [],
        globalStats: {
          totalRequests: 0,
          requestsFromPreset: 0,
          requestsManual: 0,
          presetUsageRate: 0,
        }
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}