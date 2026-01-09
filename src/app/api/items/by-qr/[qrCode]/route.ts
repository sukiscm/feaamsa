// src/app/api/items/by-qr/[qrCode]/route.ts
import { authOptions } from "@/auth";
import { getServerSession } from "next-auth";
import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> } // 👈 Promise
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
    const { qrCode } = await params; // 👈 await params

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACK_URL}/items/by-qr/${qrCode}`,
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
      JSON.stringify({ message: error.message || "Error al buscar item" }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}