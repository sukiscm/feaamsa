// src/app/hooks/usePresets.ts
import { useEffect, useState } from "react";

export enum PresetType {
  MANTENIMIENTO_GENERAL = 'MANTENIMIENTO_GENERAL',
  INSTALACION_MINISPLIT = 'INSTALACION_MINISPLIT',
  REPARACION_URGENTE = 'REPARACION_URGENTE',
  LIMPIEZA_PREVENTIVA = 'LIMPIEZA_PREVENTIVA',
}

export interface PresetItem {
  itemId: string;
  quantity: number;
  notes?: string;
}

export interface Preset {
  id: string;
  name: string;
  type: string;
  description?: string;
  items: PresetItem[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PresetWithDetails extends Preset {
  itemsWithDetails: Array<{
    item: {
      id: string;
      descripcion: string;
      categoria?: string;
      inventario: number;
    };
    quantity: number;
    notes?: string;
  }>;
}

// 👇 AGREGAR PARÁMETRO OPCIONAL
export function usePresets(includeInactive = true) { // 👈 Por defecto trae todos
  const [data, setData] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // 👇 AGREGAR QUERY PARAM
    const url = includeInactive 
      ? '/api/material-requests/presets?includeInactive=true'
      : '/api/material-requests/presets';

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar presets");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [includeInactive]);

  const refetch = () => {
    setLoading(true);
    const url = includeInactive 
      ? '/api/material-requests/presets?includeInactive=true'
      : '/api/material-requests/presets';

    fetch(url)
      .then((r) => r.json())
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}

export async function getPresetWithDetails(id: string): Promise<PresetWithDetails> {
  const r = await fetch(`/api/material-requests/presets/${id}`);
  if (!r.ok) throw new Error("Error al cargar preset");
  return r.json();
}