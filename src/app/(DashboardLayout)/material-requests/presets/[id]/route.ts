// src/app/api/material-requests/presets/[id]/route.ts
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

  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`,
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
    console.error(`Error fetching preset ${id}:`, error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al cargar preset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 👇 NUEVO: Actualizar preset
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    const body = await req.text();

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`,
      {
        method: "PATCH",
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
    console.error(`Error updating preset ${id}:`, error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al actualizar preset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// 👇 NUEVO: Eliminar preset
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      }
    );

    return new Response(await r.text(), { 
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error(`Error deleting preset ${id}:`, error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al eliminar preset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}