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
  Tabs,
  Tab,
} from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import { IconEdit, IconEye, IconPlus, IconToggleLeft, IconToggleRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { usePresets, type Preset } from '@/app/hooks/usePresets';

type TabValue = 'active' | 'inactive' | 'all';

export default function PresetsAdminPage() {
  const router = useRouter();
  const { data: allData, loading, error, refetch } = usePresets();

  const [activeTab, setActiveTab] = useState<TabValue>('active');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filtrar según el tab activo
  const data = React.useMemo(() => {
    if (activeTab === 'all') return allData;
    if (activeTab === 'active') return allData.filter(p => p.active);
    if (activeTab === 'inactive') return allData.filter(p => !p.active);
    return allData;
  }, [allData, activeTab]);

  const handleToggleActive = async (preset: Preset) => {
    const newStatus = !preset.active;
    const action = newStatus ? 'activar' : 'desactivar';

    if (!confirm(`¿Estás seguro de ${action} el preset "${preset.name}"?`)) {
      return;
    }

    setActionLoading(preset.id);

    try {
      const response = await fetch(`/api/material-requests/presets/${preset.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error al ${action} preset`);
      }

      await refetch();
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

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

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab 
              label={`Activos (${allData.filter(p => p.active).length})`} 
              value="active" 
            />
            <Tab 
              label={`Inactivos (${allData.filter(p => !p.active).length})`} 
              value="inactive" 
            />
            <Tab 
              label={`Todos (${allData.length})`} 
              value="all" 
            />
          </Tabs>
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

              <Tooltip title={row.original.active ? 'Desactivar' : 'Activar'}>
                <IconButton
                  size="small"
                  color={row.original.active ? 'warning' : 'success'}
                  onClick={() => handleToggleActive(row.original)}
                  disabled={actionLoading === row.original.id}
                >
                  {row.original.active ? (
                    <IconToggleLeft size={18} />
                  ) : (
                    <IconToggleRight size={18} />
                  )}
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
              pageIndex: 0,
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