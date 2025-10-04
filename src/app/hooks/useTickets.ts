// src/hooks/useTickets.ts
import { useEffect, useMemo, useRef, useState } from "react";

export interface UseTicketsParams {
  page?: number;         // 1-based
  limit?: number;
  status?: string;
  search?: string;
  priority?: string;
  sortBy?: string;       // e.g. "createdAt"
  sortDir?: "ASC" | "DESC";
  refetchKey?: number;   // cambia este valor para forzar refetch
}

export function useTickets(params?: UseTicketsParams) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // si haces búsqueda por texto, puedes debounc-earla (opcional):
  const debouncedSearch = useDebounce(params?.search, 300);

  const qs = useMemo(() => {
    const q = new URLSearchParams({
      page: String(params?.page ?? 1),
      limit: String(params?.limit ?? 10),
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.priority ? { priority: params.priority } : {}),
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(params?.sortBy ? { sortBy: params.sortBy } : {}),
      ...(params?.sortDir ? { sortDir: params.sortDir } : {}),
    });
    return q.toString();
  }, [params?.page, params?.limit, params?.status, params?.priority, debouncedSearch, params?.sortBy, params?.sortDir]);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // cancela petición previa
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    fetch(`/api/tickets?${qs}`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          const msg = await r.text();
          throw new Error(msg || `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((res) => {
        setData(res.items ?? []);
        setTotal(Number(res.total ?? 0));
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || "Error al cargar tickets");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [qs, params?.refetchKey]);

  return { data, total, loading, error };
}

/* --------- util opcional: debounce --------- */
function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
