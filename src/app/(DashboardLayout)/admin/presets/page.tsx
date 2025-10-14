// src/app/(DashboardLayout)/admin/presets/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { IconEdit, IconTrash, IconPlus, IconEye } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { usePresets, type Preset } from '@/app/hooks/usePresets';

export default function PresetsAdminPage() {
  const router = useRouter();
  const { data, loading, error, refetch } = usePresets();

  const columns = React.useMemo<MRT_ColumnDef<Preset>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nombre',
        size: 200,
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        size: 180,
        Cell: ({ cell }) => (
          <Chip label={cell.getValue<string>()} size="small" color="info" />
        ),
      },
      {
        accessorKey: 'description',
        header: 'Descripción',
        size: 300,
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
        accessorKey: 'active',
        header: 'Estado',
        size: 100,
        Cell: ({ cell }) => (
          <Chip
            label={cell.getValue() ? 'Activo' : 'Inactivo'}
            color={cell.getValue() ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: 'Última actualización',
        size: 180,
        Cell: ({ cell }) =>
          new Date(cell.getValue<string>()).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
      },
    ],
    []
  );

  if (error) {
    return (
      <PageContainer title="Presets" description="Gestión de plantillas">
        <DashboardCard title="Plantillas de Requisiciones">
          <Alert severity="error">{error}</Alert>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Presets" description="Gestión de plantillas">
      <DashboardCard title="🎯 Plantillas de Requisiciones">
        <Box sx={{ mb: 2 }}>
          <Alert severity="info">
            Las plantillas permiten crear requisiciones rápidamente con items predefinidos
          </Alert>
        </Box>

        <MaterialReactTable
          columns={columns}
          data={data}
          localization={MRT_Localization_ES}

          enableRowActions
          positionActionsColumn="last"

          renderRowActions={({ row }) => (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="Ver detalles">
                <IconButton
                  size="small"
                  onClick={() => router.push(`/admin/presets/${row.original.id}`)}
                >
                  <IconEye size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Editar">
                <IconButton
                  size="small"
                  onClick={() => router.push(`/admin/presets/${row.original.id}/edit`)}
                >
                  <IconEdit size={18} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Eliminar">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    // Implementar lógica de eliminación
                    alert('Eliminar preset');
                  }}
                >
                  <IconTrash size={18} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          renderTopToolbarCustomActions={() => (
            <Button
              variant="contained"
              startIcon={<IconPlus size={18} />}
              onClick={() => router.push('/admin/presets/new')}
            >
              Nuevo Preset
            </Button>
          )}

            initialState={{
            density: 'compact',
            pagination: { 
              pageSize: 10, 
              pageIndex: 0  // 👈 AGREGADO
            },
          }}

          state={{ isLoading: loading }}

          enableColumnResizing
          enableSorting
          enablePagination
          enableStickyHeader

          muiTableContainerProps={{
            sx: { maxHeight: '65vh' },
          }}
        />
      </DashboardCard>
    </PageContainer>
  );
}