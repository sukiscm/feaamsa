'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Button, Chip, Stack } from '@mui/material';

import { MRT_Table, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useTickets } from '@/app/hooks/useTickets';
import CreateTicketDialog from './components/CreateTicketDialog';

// Ajusta a lo que regresa tu API
type Ticket = {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT';
  status: 'OPEN'|'IN_PROGRESS'|'DONE'|'CANCELED';
  location?: string;
  scheduledAt?: string; // ISO
  createdAt: string;    // ISO
  requestedBy?: { email?: string; name?: string };
};

export default function TicketsPage() {
  // estado de tabla (server-side)
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{id: string; desc: boolean}[]>([]);
  const [refetchKey, setRefetchKey] = useState(0);
  // llama a tu hook pasando page+limit (tu hook ya lo hace)
const { data, total, loading, error } = useTickets({
  page: pagination.pageIndex + 1,
  limit: pagination.pageSize,
  sortBy: sorting[0]?.id,
  sortDir: sorting[0]?.desc ? "DESC" : "ASC",
  // status, priority, search si los usas
  refetchKey,
});

  const rows: Ticket[] = data ?? [];

  const columns = useMemo<MRT_ColumnDef<Ticket>[]>(() => [
    { accessorKey: 'title', header: 'Título', size: 220 },
    { accessorKey: 'location', header: 'Ubicación', size: 140 },
    {
      accessorKey: 'priority',
      header: 'Prioridad',
      size: 120,
      Cell: ({ cell }) => {
        const p = cell.getValue<'LOW'|'MEDIUM'|'HIGH'|'URGENT'>();
        const color =
          p === 'URGENT' ? 'error' :
          p === 'HIGH'   ? 'warning' :
          p === 'MEDIUM' ? 'info' : 'default';
        return <Chip label={p} color={color as any} size="small" />;
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 140,
      Cell: ({ cell }) => {
        const s = cell.getValue<'OPEN'|'IN_PROGRESS'|'DONE'|'CANCELED'>();
        const color =
          s === 'OPEN' ? 'info' :
          s === 'IN_PROGRESS' ? 'warning' :
          s === 'DONE' ? 'success' :
          'default';
        return <Chip label={s} color={color as any} size="small" variant="outlined" />;
      },
    },
    {
      accessorKey: 'scheduledAt',
      header: 'Programado',
      size: 160,
      Cell: ({ cell }) => {
        const iso = cell.getValue<string | undefined>();
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleString();
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Creado',
      size: 160,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString(),
    },
    {
      accessorKey: 'requestedBy.email',
      header: 'Solicitó',
      size: 200,
      Cell: ({ row }) => row.original.requestedBy?.email ?? '—',
      enableSorting: false, // si tu API no permite ordenar por nested
    },
  ], []);

  const table = useMaterialReactTable<Ticket>({
    columns,
    data: rows,
    // server-side features
    manualPagination: true,
    manualSorting: true,
    rowCount: total ?? 0,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      isLoading: loading,
      pagination,
      sorting,
    },
    // UI/UX
    enableRowSelection: false,
    initialState: {
      density: 'comfortable',
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    muiTableBodyProps: { sx: { '& tr:hover': { backgroundColor: 'action.hover' } } },
  });

  return (
    <PageContainer title="Tickets" description="Listado de tickets">
      <DashboardCard title="Tickets">
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button variant="contained" onClick={() => setOpen(true)}>Nuevo Ticket</Button>
        </Stack>


        <MRT_Table table={table} />
        <CreateTicketDialog
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => setRefetchKey(k => k + 1)}
        />
      </DashboardCard>
    </PageContainer>
  );
}
