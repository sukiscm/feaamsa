// src/app/hooks/useMaterialRequests.ts
import { useEffect, useState } from "react";

export interface MaterialRequestItem {
  id: string;
  item: {
    id: string;
    descripcion: string;
    categoria?: string;
  };
  quantityRequested: string;
  quantityApproved: string;
  quantityDelivered: string;
  quantityReturned?: string;
  notes?: string;
}

export interface MaterialRequest {
  id: string;
  folio: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DELIVERED' | 'PARTIAL' | 'CANCELLED';
  ticket: {
    id: string;
    title: string;
  };
  requestedBy: {
    id: string;
    email: string;
    name?: string;
  };
  approvedBy?: {
    id: string;
    email: string;
    name?: string;
  };
  deliveredBy?: {
    id: string;
    email: string;
  };
  notes?: string;
  rejectionReason?: string;
  items: MaterialRequestItem[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  deliveredAt?: string;
}

interface UseMaterialRequestsParams {
  ticketId?: string;
  status?: string;
  userId?: string;
}

export function useMaterialRequests(params?: UseMaterialRequestsParams) {
  const [data, setData] = useState<MaterialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const qs = new URLSearchParams({
    ...(params?.ticketId ? { ticketId: params.ticketId } : {}),
    ...(params?.status ? { status: params.status } : {}),
    ...(params?.userId ? { userId: params.userId } : {}),
  }).toString();

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/material-requests${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar solicitudes");
        return r.json();
      })
      .then((requests: MaterialRequest[]) => {
        setData(requests);
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
    
    fetch(`/api/material-requests${qs ? `?${qs}` : ""}`)
      .then((r) => {
        if (!r.ok) throw new Error("Error al cargar solicitudes");
        return r.json();
      })
      .then((requests: MaterialRequest[]) => {
        setData(requests);
      })
      .catch((err) => {
        setError(err.message);
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  return { data, loading, error, refetch };
}