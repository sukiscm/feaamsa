'use client';

import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { IconEye, IconCheck, IconX } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useMaterialRequests, type MaterialRequest } from '@/app/hooks/useMaterialRequests';

type TabValue = 'all' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export default function MaterialRequestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabValue>('PENDING');

  // Filtrar por estado
  const statusFilter = activeTab === 'all' ? undefined : activeTab;
  const { data, loading, refetch } = useMaterialRequests({ status: statusFilter });

  const rows: MaterialRequest[] = data ?? [];

  const statusColor = (status: string) => {
    const colors: Record<string, any> = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'error',
      DELIVERED: 'info',
      CANCELLED: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = useMemo<MRT_ColumnDef<MaterialRequest>[]>(() => [
    { 
      accessorKey: 'folio', 
      header: 'Folio', 
      size: 150,
      Cell: ({ cell }) => (
        <Box sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
          {cell.getValue<string>()}
        </Box>
      ),
    },
    {
      accessorKey: 'ticket.title',
      header: 'Ticket',
      size: 220,
      Cell: ({ row }) => (
        <Box>
          <Box sx={{ fontWeight: 500 }}>{row.original.ticket.title}</Box>
          <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            ID: {row.original.ticket.id.slice(0, 8)}...
          </Box>
        </Box>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 130,
      Cell: ({ cell }) => {
        const status = cell.getValue<string>();
        return <Chip label={status} color={statusColor(status)} size="small" />;
      },
    },
    {
      id: 'itemsCount',
      header: 'Items',
      size: 80,
      Cell: ({ row }) => (
        <Chip 
          label={row.original.items.length} 
          size="small" 
          variant="outlined"
        />
      ),
    },
    {
      accessorKey: 'requestedBy.email',
      header: 'Solicitado por',
      size: 200,
      Cell: ({ row }) => row.original.requestedBy?.email || '—',
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha solicitud',
      size: 160,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleString('es-MX'),
    },
    {
      accessorKey: 'approvedAt',
      header: 'Fecha aprobación',
      size: 160,
      Cell: ({ cell }) => {
        const date = cell.getValue<string | undefined>();
        return date ? new Date(date).toLocaleString('es-MX') : '—';
      },
    },
  ], []);

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    setActiveTab(newValue);
  };

  return (
    <PageContainer title="Solicitudes de Materiales" description="Gestión de material requests">
      <DashboardCard title="📦 Solicitudes de Materiales">
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Pendientes" value="PENDING" />
            <Tab label="Aprobadas" value="APPROVED" />
            <Tab label="Rechazadas" value="REJECTED" />
            <Tab label="Todas" value="all" />
          </Tabs>
        </Box>

        <MaterialReactTable
          columns={columns}
          data={rows}
          localization={MRT_Localization_ES}

          enableRowActions
          positionActionsColumn="last"
          displayColumnDefOptions={{
            'mrt-row-actions': {
              header: 'Acciones',
              size: 120,
            },
          }}

          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
              <Tooltip title="Ver detalle">
                <IconButton
                  size="small"
                  onClick={() => router.push(`/material-requests/${row.original.id}`)}
                >
                  <IconEye size={18} />
                </IconButton>
              </Tooltip>
              
              {row.original.status === 'PENDING' && (
                <>
                  <Tooltip title="Aprobar">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => router.push(`/material-requests/${row.original.id}?action=approve`)}
                    >
                      <IconCheck size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Rechazar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => router.push(`/material-requests/${row.original.id}?action=reject`)}
                    >
                      <IconX size={18} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          )}

          initialState={{
            density: 'compact',
            pagination: { pageSize: 10, pageIndex: 0 },
            sorting: [{ id: 'createdAt', desc: true }],
          }}

          state={{ isLoading: loading }}

          enableColumnResizing
          enableSorting
          enablePagination
          enableStickyHeader

          muiTableContainerProps={{
            sx: { maxHeight: '65vh' },
          }}

          muiTableBodyProps={{
            sx: { '& tr:hover': { backgroundColor: 'action.hover' } },
          }}
        />
      </DashboardCard>
    </PageContainer>
  );
}