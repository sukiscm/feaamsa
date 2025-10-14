// src/app/hooks/useItems.ts
import { useEffect, useState } from "react";

export interface Item {
  id: string;
  descripcion: string;
  serie?: string;
  categoria?: string;
  proceso?: string;
  status: string;
  inventario: number;
  activo: boolean;
  observaciones?: string; // 👈 NUEVO
  createdAt: string;
  updatedAt: string;
}

interface UseItemsParams {
  search?: string;
  categoria?: string;
  status?: string;
}

export function useItems(params?: UseItemsParams) {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = new URLSearchParams({
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.categoria ? { categoria: params.categoria } : {}),
    ...(params?.status ? { status: params.status } : {}),
  }).toString();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/items${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar items");
        return r.json();
      })
      .then((items: Item[]) => {
        setData(items);
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [qs]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/items${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar items");
        return r.json();
      })
      .then((items: Item[]) => {
        setData(items);
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}