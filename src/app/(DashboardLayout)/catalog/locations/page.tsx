// src/app/(DashboardLayout)/catalog/locations/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Alert, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import PageContainer from '../../components/container/PageContainer';
import DashboardCard from '../../components/shared/DashboardCard';
import { useLocations, type Location } from '@/app/hooks/useLocations';
import { IconPlus, IconRefresh, IconEdit, IconTrash, IconMapPin } from '@tabler/icons-react';
import LocationModal from './LocationModal';

// Chip de tipo
const tipoChip = (tipo: string | undefined) => {
  const tipoMap: Record<string, { label: string; color: any; icon: string }> = {
    ALMACEN: { label: 'Almacén', color: 'primary', icon: '📦' },
    TALLER: { label: 'Taller', color: 'info', icon: '🔧' },
    OFICINA: { label: 'Oficina', color: 'secondary', icon: '🏢' },
    SUCURSAL: { label: 'Sucursal', color: 'success', icon: '🏪' },
    OTRO: { label: 'Otro', color: 'default', icon: '📍' },
  };

  const config = tipoMap[tipo || 'OTRO'];
  return (
    <Chip 
      label={`${config.icon} ${config.label}`} 
      color={config.color} 
      size="small" 
      variant="outlined" 
    />
  );
};

// Chip de estado
const statusChip = (status: string | undefined) => {
  const color = status === 'ACTIVA' ? 'success' : 'error';
  const label = status === 'ACTIVA' ? 'Activa' : 'Inactiva';
  return <Chip label={label} color={color} size="small" />;
};

export default function LocationsPage() {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  const { data: locations, loading, error, refetch } = useLocations({ 
    search, 
    tipo: filterTipo 
  });

  // Handlers del modal
  const handleOpenCreate = () => {
    setSelectedLocation(null);
    setModalMode('create');
    setModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleOpenEdit = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('edit');
    setModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedLocation(null);
  };

  // Guardar ubicación (crear o editar)
  const handleSaveLocation = async (locationData: Partial<Location>) => {
    try {
      const url = modalMode === 'edit' ? `/api/locations/${selectedLocation?.id}` : '/api/locations';
      const method = modalMode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(locationData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la ubicación');
      }

      setActionSuccess(
        modalMode === 'create' 
          ? 'Ubicación creada exitosamente' 
          : 'Ubicación actualizada exitosamente'
      );
      
      // Recargar ubicaciones
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      throw new Error(err.message || 'Error al guardar');
    }
  };

  // Eliminar ubicación
  const handleDelete = async (location: Location) => {
    if (!confirm(`¿Estás seguro de eliminar "${location.nombre}"?\n\nNota: Si tiene inventario asociado, solo se marcará como inactiva.`)) return;

    try {
      const response = await fetch(`/api/locations/${location.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar la ubicación');
      }

      setActionSuccess('Ubicación eliminada/desactivada exitosamente');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message || 'Error al eliminar');
    }
  };

  // Columnas
  const columns = useMemo<MRT_ColumnDef<Location>[]>(() => [
    { 
      accessorKey: 'nombre', 
      header: 'Nombre', 
      size: 250,
      enableColumnFilter: true,
      Cell: ({ row }) => (
        <Box display="flex" alignItems="center" gap={1}>
          <IconMapPin size={18} />
          <strong>{row.original.nombre}</strong>
        </Box>
      ),
    },
    { 
      accessorKey: 'codigo', 
      header: 'Código', 
      size: 120,
      Cell: ({ cell }) => {
        const codigo = cell.getValue<string>();
        return (
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {codigo || '—'}
          </Box>
        );
      },
    },
    { 
      accessorKey: 'tipo', 
      header: 'Tipo', 
      size: 140,
      filterVariant: 'select',
      Cell: ({ cell }) => tipoChip(cell.getValue<string>()),
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 120,
      Cell: ({ cell }) => statusChip(cell.getValue<string>()),
    },
    {
      accessorKey: 'direccion',
      header: 'Dirección',
      size: 200,
      enableColumnFilter: false,
      Cell: ({ cell }) => {
        const direccion = cell.getValue<string>();
        if (!direccion) return '—';
        return (
          <Box 
            sx={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={direccion}
          >
            {direccion}
          </Box>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última actualización',
      size: 180,
      Cell: ({ cell }) => new Date(cell.getValue<string>()).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      enableColumnFilter: false,
    },
  ], []);

  return (
    <PageContainer title="Ubicaciones" description="Gestión de almacenes y ubicaciones">
      <DashboardCard title="📍 Ubicaciones / Almacenes">
        {/* Mensajes de éxito/error */}
        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}
        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Box>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <MaterialReactTable
              columns={columns}
              data={locations}
              localization={MRT_Localization_ES}

              // UX base
              enableColumnResizing
              enableGlobalFilter
              enableColumnFilters
              enableSorting
              enablePagination
              enableStickyHeader
              enableFullScreenToggle
              enableRowActions
              positionGlobalFilter="left"
              positionActionsColumn="last"
              
              // Toolbar personalizado
              renderTopToolbarCustomActions={() => (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<IconPlus />}
                    onClick={handleOpenCreate}
                    size="small"
                  >
                    Nueva Ubicación
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<IconRefresh />}
                    onClick={() => refetch()}
                    size="small"
                  >
                    Actualizar
                  </Button>
                </Box>
              )}

              // Acciones por fila
              renderRowActions={({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenEdit(row.original)}
                    >
                      <IconEdit size={18} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(row.original)}
                    >
                      <IconTrash size={18} />
                    </IconButton>
                  </Tooltip>
                </Box>
              )}

              // Estilos
              muiTableHeadCellProps={{
                sx: {
                  fontWeight: 'bold',
                  fontSize: '0.875rem',
                },
              }}

              muiTablePaperProps={{
                elevation: 0,
                sx: {
                  border: '1px solid',
                  borderColor: 'divider',
                },
              }}

              muiTableBodyRowProps={{
                sx: {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: (t) => t.palette.action.hover },
                },
              }}

              // Paginación
              muiPaginationProps={{
                rowsPerPageOptions: [5, 10, 20, 50],
                shape: 'rounded',
                size: 'small',
              }}
            />
          )}
        </Box>

        {/* Modal de crear/editar */}
        <LocationModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveLocation}
          location={selectedLocation}
          mode={modalMode}
        />
      </DashboardCard>
    </PageContainer>
  );
}