// src/app/api/material-requests/presets/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// ✅ GET - Ya lo tienes
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    // 👇 PASAR QUERY PARAMS AL BACKEND
    const url = new URL(req.url);
    const includeInactive = url.searchParams.get('includeInactive');
    
    const backendUrl = includeInactive 
      ? `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets?includeInactive=true`
      : `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets`;

    const r = await fetch(backendUrl, {
      headers: { Authorization: `Bearer ${access}` },
      cache: "no-store",
    });

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

// 👇 AGREGAR POST
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  try {
    const body = await req.text();

    console.log('📝 POST URL:', `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets`);

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

    if (!r.ok) {
      const errorText = await r.text();
      console.error('❌ Error del backend:', errorText);
      throw new Error(errorText || 'Error al crear preset');
    }

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