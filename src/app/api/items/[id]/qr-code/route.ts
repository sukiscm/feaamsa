// src/app/api/items/[id]/qr-code/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // 👈 Promise
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
    const { id: itemId } = await params; // 👈 await params

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/items/${itemId}/qr-code`,
      {
        method: "POST",
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
      JSON.stringify({ message: error.message || "Error al generar QR" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}