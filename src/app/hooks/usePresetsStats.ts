// src/app/hooks/usePresetStats.ts (continuación)
import { useEffect, useState } from "react";

export interface PresetStats {
  preset: {
    id: string;
    name: string;
    type: string;
    description?: string;
  } | null;
  stats: {
    totalUsage: number;
    modifiedUsage: number;
    approvedUsage: number;
    modificationRate: number;
    approvalRate: number;
  };
}

export interface GlobalStats {
  totalRequests: number;
  requestsFromPreset: number;
  requestsManual: number;
  presetUsageRate: number;
}

export interface StatsResponse {
  presetsWithStats: PresetStats[];
  globalStats: GlobalStats;
}

export interface TopItem {
  item: {
    id: string;
    descripcion: string;
    categoria?: string;
    inventario: number;
  } | null;
  requestCount: number;
  totalQuantity: number;
}

export function usePresetStats() {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/material-requests/presets/stats/usage');
      if (!response.ok) throw new Error('Error al cargar estadísticas');
      const stats = await response.json();
      setData(stats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadStats };
}

export function useTopItemsFromPresets(limit = 10) {
  const [data, setData] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTopItems();
  }, [limit]);

  const loadTopItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/material-requests/presets/stats/top-items?limit=${limit}`);
      if (!response.ok) throw new Error('Error al cargar items populares');
      const items = await response.json();
      setData(items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: loadTopItems };
}

export async function getStatsByPeriod(startDate: Date, endDate: Date) {
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const response = await fetch(
    `/api/material-requests/presets/stats/period?startDate=${start}&endDate=${end}`
  );
  
  if (!response.ok) throw new Error('Error al cargar estadísticas del periodo');
  return response.json();
}