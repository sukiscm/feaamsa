// src/app/(DashboardLayout)/inventario/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Box, Button, Chip, Alert, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import PageContainer from '../components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import { useItems, type Item } from '@/app/hooks/useItems';
import { IconPlus, IconRefresh, IconEdit, IconTrash, IconFileSpreadsheet } from '@tabler/icons-react';
import ItemModal from './ItemModal';

// Chip de estado
const statusChip = (status: string, activo: boolean) => {
  if (!activo) return <Chip label="Inactivo" color="default" size="small" variant="outlined" />;
  
  const color = status === 'EN OPERACIÓN' ? 'success' : 'warning';
  return <Chip label={status} color={color} size="small" variant="outlined" />;
};

// Chip de stock
const stockChip = (cantidad: number) => {
  const label = cantidad >= 50 ? 'Alto' : cantidad >= 10 ? 'Medio' : cantidad > 0 ? 'Bajo' : 'Agotado';
  const color: 'success' | 'warning' | 'error' | 'default' = 
    cantidad >= 50 ? 'success' : 
    cantidad >= 10 ? 'warning' : 
    cantidad > 0 ? 'error' : 'default';
  
  return <Chip label={`${label} (${cantidad})`} color={color} size="small" />;
};

// 📊 Función para exportar a Excel/CSV
const exportToExcel = (data: Item[]) => {
  // Preparar los datos para exportación
  const exportData = data.map(item => ({
    'Descripción': item.descripcion,
    'Serie': item.serie || 'S/N',
    'Categoría': item.categoria || '',
    'Proceso': item.proceso || '',
    'Estado': item.activo ? item.status : 'Inactivo',
    'Stock': item.inventario,
    'Observaciones': item.observaciones || '',
    'Última Actualización': new Date(item.updatedAt).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }));

  // Convertir a CSV
  const headers = Object.keys(exportData[0]);
  const csvContent = [
    headers.join(','),
    ...exportData.map(row => 
      headers.map(header => {
        const value = row[header as keyof typeof row];
        // Escapar comillas y envolver en comillas si contiene comas
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      }).join(',')
    )
  ].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function InventarioPage() {
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  
  const { data: items, loading, error, refetch } = useItems({ 
    search, 
    categoria: filterCategoria 
  });

  // Handlers del modal
  const handleOpenCreate = () => {
    setSelectedItem(null);
    setModalMode('create');
    setModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleOpenEdit = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
  };

  // Guardar item (crear o editar)
  const handleSaveItem = async (itemData: Partial<Item>) => {
    try {
      const url = modalMode === 'edit' ? `/api/items/${selectedItem?.id}` : '/api/items';
      const method = modalMode === 'edit' ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el item');
      }

      setActionSuccess(
        modalMode === 'create' 
          ? 'Item creado exitosamente' 
          : 'Item actualizado exitosamente'
      );
      
      // Recargar items
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      throw new Error(err.message || 'Error al guardar');
    }
  };

  // Eliminar item
  const handleDelete = async (item: Item) => {
    if (!confirm(`¿Estás seguro de eliminar "${item.descripcion}"?`)) return;

    try {
      const response = await fetch(`/api/items/${item.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el item');
      }

      setActionSuccess('Item eliminado exitosamente');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setActionError(err.message || 'Error al eliminar');
    }
  };

  // Columnas
  const columns = useMemo<MRT_ColumnDef<Item>[]>(() => [
    { 
      accessorKey: 'descripcion', 
      header: 'Descripción', 
      size: 300,
      enableColumnFilter: true,
    },
    { 
      accessorKey: 'serie', 
      header: 'Serie', 
      size: 100,
      Cell: ({ cell }) => <>{cell.getValue() || 'S/N'}</>,
    },
    { 
      accessorKey: 'categoria', 
      header: 'Categoría', 
      size: 140,
      filterVariant: 'select',
    },
    { 
      accessorKey: 'proceso', 
      header: 'Proceso', 
      size: 140,
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      size: 140,
      Cell: ({ row }) => statusChip(row.original.status, row.original.activo),
    },
    {
      accessorKey: 'inventario',
      header: 'Stock',
      size: 140,
      Cell: ({ cell }) => stockChip(cell.getValue<number>()),
      sortingFn: 'basic',
      filterVariant: 'range',
    },
    {
      accessorKey: 'observaciones',
      header: 'Observaciones',
      size: 200,
      Cell: ({ cell }) => {
        const obs = cell.getValue<string>();
        if (!obs) return '—';
        return (
          <Box 
            sx={{ 
              maxWidth: 200, 
              overflow: 'hidden', 
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
            title={obs}
          >
            {obs}
          </Box>
        );
      },
    },
    {
      accessorKey: 'updatedAt',
      header: 'Última actualización',
      size: 180,
      Cell: ({ cell }) => {
        const date = new Date(cell.getValue<string>());
        return date.toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
    },
  ], []);

  if (error) {
    return (
      <PageContainer title="Inventario" description="Control de inventario del almacén">
        <DashboardCard title="Inventario">
          <Alert severity="error">{error}</Alert>
        </DashboardCard>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Inventario" description="Control de inventario del almacén">
      <DashboardCard title="Inventario">
        <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
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

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <MaterialReactTable
              columns={columns}
              data={items}
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
              
              muiTableContainerProps={{
                sx: { maxHeight: '60vh' }
              }}
              
              initialState={{
                density: 'compact',
                pagination: { pageSize: 10, pageIndex: 0 },
                showGlobalFilter: true,
                columnPinning: { left: ['descripcion'] },
              }}

              // Acciones por fila
              renderRowActions={({ row }) => (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
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

              // 📊 Toolbar superior con botón de exportar a Excel
              renderTopToolbarCustomActions={() => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="contained" 
                    size="small" 
                    startIcon={<IconPlus size={18} />}
                    onClick={handleOpenCreate}
                  >
                    Nuevo Item
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    startIcon={<IconRefresh size={18} />}
                    onClick={() => refetch()}
                  >
                    Actualizar
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="small"
                    color="success"
                    startIcon={<IconFileSpreadsheet size={18} />}
                    onClick={() => exportToExcel(items)}
                  >
                    Exportar a Excel
                  </Button>
                </Box>
              )}

              muiTopToolbarProps={{
                sx: {
                  px: 2,
                  gap: 2,
                  borderBottom: (t) => `1px solid ${t.palette.divider}`,
                },
              }}

              muiSearchTextFieldProps={{
                placeholder: 'Buscar en inventario…',
                size: 'small',
                variant: 'outlined',
              }}

              muiTablePaperProps={{
                sx: {
                  borderRadius: 3,
                  boxShadow: 3,
                  overflow: 'hidden',
                },
              }}

              muiTableHeadCellProps={{
                sx: {
                  fontWeight: 700,
                  backgroundColor: (t) =>
                    t.palette.mode === 'light' ?
                    t.palette.grey[50] : t.palette.background.paper,
                },
              }}

              muiTableBodyRowProps={{
                sx: {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: (t) => t.palette.action.hover },
                },
              }}

              muiPaginationProps={{
                rowsPerPageOptions: [5, 10, 20, 50],
                shape: 'rounded',
                size: 'small',
              }}
            />
          )}
        </Box>

        {/* Modal de crear/editar */}
        <ItemModal
          open={modalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveItem}
          item={selectedItem}
          mode={modalMode}
        />
      </DashboardCard>
    </PageContainer>
  );
}