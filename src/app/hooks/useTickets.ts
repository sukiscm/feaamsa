// src/hooks/useTickets.ts
import { useEffect, useState } from "react";

interface UseTicketsParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  priority?: string;
}

export function useTickets(params?: UseTicketsParams) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const qs = new URLSearchParams({
    page: String(params?.page ?? 1),
    limit: String(params?.limit ?? 10),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.priority ? { priority: params.priority } : {}),
    ...(params?.search ? { search: params.search } : {}),
  }).toString();

  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets?${qs}`)
      .then((r) => r.json())
      .then((res) => {
        // 👇 suponiendo que tu backend devuelve { items: [], total: number }
        setData(res.items ?? []);
        setTotal(res.total ?? 0);
      })
      .finally(() => setLoading(false));
  }, [qs]);

  return { data, total, loading };
}
