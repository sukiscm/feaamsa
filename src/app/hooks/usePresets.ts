// src/app/hooks/usePresets.ts
import { useEffect, useState } from "react";

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

export function usePresets() {
  const [data, setData] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/material-requests/presets')
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar presets");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const refetch = () => {
    setLoading(true);
    fetch('/api/material-requests/presets')
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