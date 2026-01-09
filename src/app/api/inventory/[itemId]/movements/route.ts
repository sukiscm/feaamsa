// src/app/api/inventory/[itemId]/movements/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { itemId: string } }
) {
  const session = await getServerSession(authOptions);
  const access = (session as any)?.access_token;
  
  if (!access) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const itemId = params.itemId;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/inventory/${itemId}/movements`,
      {
        headers: { Authorization: `Bearer ${access}` },
        cache: "no-store",
      }
    );

    const data = await res.text();
    return new Response(data, { 
      status: res.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({ message: error.message || "Error al cargar movimientos" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}