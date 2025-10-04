// src/hooks/useCreateTicket.ts
import { useState } from "react";

export type CreateTicketInput = {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  location?: string;
  scheduledAt?: string;
};

function parseNestErrorBody(body: any): string {
  // Soporta errores comunes de Nest:
  // - { message: '...' }
  // - { message: ['e1','e2', ...] } (ValidationPipe)
  // - texto plano
  if (!body) return "Error desconocido";
  if (typeof body === "string") return body;
  if (Array.isArray(body.message)) return body.message.join(" • ");
  if (typeof body.message === "string") return body.message;
  if (typeof body.error === "string") return body.error;
  try { return JSON.stringify(body); } catch { return "Error desconocido"; }
}

export function useCreateTicket() {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function createTicket(input: CreateTicketInput) {
    setLoading(true);
    setError(null);

    let resp: Response | null = null;
    try {
      resp = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!resp.ok) {
        const contentType = resp.headers.get("content-type") || "";
        const body = contentType.includes("application/json")
          ? await resp.json().catch(() => null)
          : await resp.text().catch(() => null);

        const msg = parseNestErrorBody(body);
        setError(msg);
        throw new Error(msg);
      }

      const data = await resp.json();
      return data;
    } finally {
      setLoading(false);
    }
  }

  return { createTicket, loading, error, setError };
}
