// src/app/api/material-requests/presets/[id]/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

// ✅ GET - Ya lo tienes
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
      const errorText = await r.text();
      console.error('❌ Error del backend:', errorText);
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

// 👇 AGREGAR PATCH
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

    console.log('📝 PATCH URL:', `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`);
    console.log('📦 Body:', body);

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

    if (!r.ok) {
      const errorText = await r.text();
      console.error('❌ Error del backend:', errorText);
      throw new Error(errorText || 'Error al actualizar preset');
    }

    const result = await r.text();
    console.log('✅ Preset actualizado');

    return new Response(result, { 
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

// 👇 AGREGAR DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  if (!access) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;

  try {
    console.log('🗑️ DELETE URL:', `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`);

    const r = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/material-requests/presets/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      }
    );

    if (!r.ok) {
      const errorText = await r.text();
      console.error('❌ Error del backend:', errorText);
      throw new Error(errorText || 'Error al eliminar preset');
    }

    console.log('✅ Preset eliminado');

    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error deleting preset ${id}:`, error);
    return new Response(
      JSON.stringify({ message: error.message || 'Error al eliminar preset' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}