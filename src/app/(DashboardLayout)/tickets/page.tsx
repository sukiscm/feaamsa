'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Chip, IconButton, Tooltip, Box, Stack, Button } from '@mui/material';
import { MRT_Table, useMaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { IconEye, IconPackage } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useTickets } from '@/app/hooks/useTickets';
import CreateMaterialRequestModal from './components/CreateMaterialRequestModal';
import CreateTicketDialog from './components/CreateTicketDialog';

type Ticket = {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW'|'MEDIUM'|'HIGH'|'URGENT';
  status: 'OPEN'|'IN_PROGRESS'|'DONE'|'CANCELED';
  location?: string;
  scheduledAt?: string;
  createdAt: string;
  requestedBy?: { email?: string; name?: string };
};

export default function TicketsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [sorting, setSorting] = useState<{id: string; desc: boolean}[]>([]);
  const [refetchKey, setRefetchKey] = useState(0);
  // Modal de material request
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const { data, total, loading } = useTickets({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
    refetchKey
  });

  const rows: Ticket[] = data ?? [];

  const handleOpenMaterialRequest = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  const handleCloseMaterialRequest = () => {
    setModalOpen(false);
    setSelectedTicket(null);
  };

  const handleSuccess = () => {
    console.log('Material request creado exitosamente');
  };

  const columns = useMemo<MRT_ColumnDef<Ticket>[]>(() => [
    { accessorKey: 'title', header: 'Título', size: 200 },
    { accessorKey: 'location', header: 'Ubicación', size: 120 },
    {
      accessorKey: 'priority',
      header: 'Prioridad',
      size: 100,
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
      size: 120,
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
      accessorKey: 'createdAt',
      header: 'Creado',
      size: 140,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString('es-MX'),
    },
    {
      accessorKey: 'requestedBy.email',
      header: 'Solicitó',
      size: 180,
      Cell: ({ row }) => row.original.requestedBy?.email ?? '—',
      enableSorting: false,
    },
  ], []);

  const table = useMaterialReactTable<Ticket>({
    columns,
    data: rows,
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
    enableRowSelection: false,
    enableRowActions: true,
    positionActionsColumn: 'last',
    displayColumnDefOptions: {
      'mrt-row-actions': {
        header: 'Acciones',
        size: 120, // 👈 Forzar ancho
      },
    },
    initialState: {
      density: 'comfortable',
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    
    // 🔥 Acciones por fila
    renderRowActions: ({ row }) => (
      <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
        <Tooltip title="Ver detalle">
          <IconButton 
            size="small"
            onClick={() => router.push(`/tickets/${row.original.id}`)}
          >
            <IconEye size={18} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Solicitar materiales">
          <IconButton 
            size="small" 
            color="primary"
            onClick={() => handleOpenMaterialRequest(row.original)}
            disabled={row.original.status === 'DONE' || row.original.status === 'CANCELED'}
          >
            <IconPackage size={18} />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    
    muiTableBodyProps: { sx: { '& tr:hover': { backgroundColor: 'action.hover' } } },
  });

  return (
    <PageContainer title="Tickets" description="Listado de tickets">
      <DashboardCard title="Tickets">
          <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button variant="contained" onClick={() => setOpen(true)}>Nuevo Ticket</Button>
        </Stack>

        <Box sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <MRT_Table table={table} />
        </Box>
      </DashboardCard>

      {/* Modal de Material Request */}
        <CreateTicketDialog
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => setRefetchKey(k => k + 1)}
        />
      {selectedTicket && (
        <CreateMaterialRequestModal
          open={modalOpen}
          onClose={handleCloseMaterialRequest}
          ticketId={selectedTicket.id}
          ticketTitle={selectedTicket.title}
          onSuccess={handleSuccess}
        />
      )}
    </PageContainer>
  );
}