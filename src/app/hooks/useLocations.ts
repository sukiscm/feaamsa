// src/app/hooks/useLocations.ts
import { useEffect, useState } from "react";

export interface Location {
  id: string;
  nombre: string;
  codigo?: string;
  tipo?: string;
  status?: string;
  direccion?: string;
  notas?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseLocationsParams {
  search?: string;
  tipo?: string;
  status?: string;
}

export function useLocations(params?: UseLocationsParams) {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = new URLSearchParams({
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.tipo ? { tipo: params.tipo } : {}),
    ...(params?.status ? { status: params.status } : {}),
  }).toString();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/locations${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar ubicaciones");
        return r.json();
      })
      .then((locations: Location[]) => {
        setData(locations);
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
    
    fetch(`/api/locations${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar ubicaciones");
        return r.json();
      })
      .then((locations: Location[]) => {
        setData(locations);
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}