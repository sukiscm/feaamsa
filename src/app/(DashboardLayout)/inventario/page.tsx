'use client';

import React, { useMemo } from 'react';
import { Box, Button, Chip } from '@mui/material';
import { MaterialReactTable, type MRT_ColumnDef } from 'material-react-table';
import { MRT_Localization_ES } from 'material-react-table/locales/es';
import PageContainer from '../components/container/PageContainer';
import DashboardCard from '../components/shared/DashboardCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { mkConfig, generateCsv, download } from 'export-to-csv';
const csvConfig = mkConfig({
  useKeysAsHeaders: true,      // usa las keys como encabezados
  filename: 'inventario',      // nombre base del archivo
  fieldSeparator: ',',         // separador CSV
});

function exportRowsToCsv(rows: any[]) {
  // rows pueden venir de table.getRowModel().rows, getPrePaginationRowModel().rows, etc.
  const rowData = rows.map((r) => r.original ?? r);
  const csv = generateCsv(csvConfig)(rowData);
  download(csvConfig)(csv);
}
 function exportRowsToPdf(rows: any[]) {
  const doc = new jsPDF();
  const rowData = rows.map((r) => r.original ?? r);
  const headers = Object.keys(rowData[0] ?? {});
  autoTable(doc, {
    head: [headers],
    body: rowData.map((r) => headers.map((h) => String(r[h] ?? ''))),
    styles: { fontSize: 8 },
  });
  doc.save('inventario.pdf');
}
// Tipo de fila
type InventoryItem = {
  id: number;
  sku: string;
  nombre: string;
  categoria: string;
  unidad: 'pz' | 'lt' | 'kg' | 'm';
  stock: number;
  stockMin: number;
  costoUnitario: number; // MXN
  precio: number;        // MXN (venta)
  proveedor: string;
  mantenimiento: string; // DD/MM/YYYY
};

// Datos demo
const data: InventoryItem[] = [
  {
    id: 1,
    sku: 'FIL-AC-0001',
    nombre: 'Filtro de Aire AC',
    categoria: 'Consumibles',
    unidad: 'pz',
    stock: 150,
    stockMin: 30,
    costoUnitario: 85.5,
    precio: 149.9,
    proveedor: 'ClimaParts MX',
    mantenimiento: '01/08/2025',
  },
  {
    id: 2,
    sku: 'GAS-410A-001',
    nombre: 'Gas Refrigerante R-410A',
    categoria: 'Refrigerante',
    unidad: 'lt',
    stock: 50,
    stockMin: 25,
    costoUnitario: 230.0,
    precio: 320.0,
    proveedor: 'FríoDistribuciones',
    mantenimiento: '15/07/2025',
  },
  {
    id: 3,
    sku: 'TERM-SMART-01',
    nombre: 'Termostato Inteligente',
    categoria: 'Electrónica',
    unidad: 'pz',
    stock: 35,
    stockMin: 15,
    costoUnitario: 680.0,
    precio: 999.0,
    proveedor: 'SmartHome Pro',
    mantenimiento: '10/06/2025',
  },
  {
    id: 4,
    sku: 'HERR-DIAG-01',
    nombre: 'Herramienta de Diagnóstico',
    categoria: 'Herramienta',
    unidad: 'pz',
    stock: 5,
    stockMin: 5,
    costoUnitario: 4500.0,
    precio: 6200.0,
    proveedor: 'TecService Tools',
    mantenimiento: '20/07/2025',
  },
  {
    id: 5,
    sku: 'BOMB-DREN-01',
    nombre: 'Bomba de Drenaje',
    categoria: 'Equipo',
    unidad: 'pz',
    stock: 10,
    stockMin: 8,
    costoUnitario: 1500.0,
    precio: 2150.0,
    proveedor: 'AquaFlow MX',
    mantenimiento: '05/08/2025',
  },
];

// Helpers
const currency = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 });

const stockChip = (stock: number) => {
  const label = stock >= 100 ? 'Alto' : stock >= 20 ? 'Medio' : 'Bajo';
  const color: 'success' | 'warning' | 'error' = stock >= 100 ? 'success' : stock >= 20 ? 'warning' : 'error';
  return <Chip label={`${label} (${stock})`} color={color} size="small" variant="outlined" />;
};

const reordenChip = (stock: number, min: number) => {
  const needs = stock <= min;
  return (
    <Chip
      label={needs ? `Reorden (${stock}/${min})` : 'OK'}
      color={needs ? 'error' : 'success'}
      size="small"
      variant={needs ? 'filled' : 'outlined'}
    />
  );
};

// Columnas
const columns: MRT_ColumnDef<InventoryItem>[] = [
  { accessorKey: 'id', header: 'ID', size: 70 },
  { accessorKey: 'sku', header: 'SKU', size: 140, enableColumnFilter: true },
  { accessorKey: 'nombre', header: 'Nombre del artículo', size: 260 },
  { accessorKey: 'categoria', header: 'Categoría', size: 140 },
  { accessorKey: 'unidad', header: 'Unidad', size: 80 },
  {
    accessorKey: 'stock',
    header: 'Stock',
    size: 120,
    Cell: ({ cell }) => stockChip(cell.getValue<number>()),
    sortingFn: 'basic',
    filterVariant: 'range',
    accessorFn: (row) => row.stock,
  },
  {
    accessorKey: 'stockMin',
    header: 'Stock mínimo',
    size: 120,
    filterVariant: 'range',
  },
  {
    id: 'reorden',
    header: 'Reorden',
    size: 120,
    Cell: ({ row }) => reordenChip(row.original.stock, row.original.stockMin),
    enableSorting: false,
    enableColumnFilter: false,
  },
  {
    accessorKey: 'costoUnitario',
    header: 'Costo',
    size: 110,
    Cell: ({ cell }) => currency(cell.getValue<number>()),
    filterVariant: 'range',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'precio',
    header: 'Precio',
    size: 110,
    Cell: ({ cell }) => currency(cell.getValue<number>()),
    filterVariant: 'range',
    sortingFn: 'basic',
  },
  {
    id: 'valorInventario',
    header: 'Valor inventario',
    size: 150,
    accessorFn: (row) => row.stock * row.costoUnitario,
    Cell: ({ cell }) => currency(cell.getValue<number>()),
    filterVariant: 'range',
    sortingFn: 'basic',
  },
  {
    accessorKey: 'proveedor',
    header: 'Proveedor',
    size: 180,
  },
  {
    accessorKey: 'mantenimiento',
    header: 'Último mantenimiento',
    size: 170,
  },
];

export default function InventarioPage() {
  const tableData = useMemo(() => data, []);

  return (
    <PageContainer title="Inventario" description="Control de inventario del almacén">
      <DashboardCard title="Inventario" >
        <Box sx={{ maxWidth: 1300, mx: 'auto' }}>
          <MaterialReactTable
            columns={columns}
            data={tableData}
            localization={MRT_Localization_ES}

            // UX base
            enableColumnResizing
            enableGlobalFilter
            enableColumnFilters
            enableSorting
            enablePagination
            enableStickyHeader
            enableFullScreenToggle
            positionGlobalFilter="left"
            initialState={{
              density: 'compact',
              pagination: { pageSize: 5, pageIndex: 0 },
              showGlobalFilter: true,
              columnPinning: { left: ['id', 'sku', 'nombre'], right: ['valorInventario'] },
            }}

            // Toolbar superior
            renderTopToolbarCustomActions={({ table }) => (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" size="small" onClick={() => alert('Acción: Agregar artículo')}>
                  + Nuevo
                </Button>
                <Button variant="outlined" size="small" onClick={() => table.resetColumnFilters()}>
                  Limpiar filtros
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

            // Contenedor y Paper
            muiTableContainerProps={{
              sx: {
                maxHeight: '60vh',
                '& .MuiTableRow-root:nth-of-type(even)': {
                  backgroundColor: (t) => t.palette.action.hover,
                },
              },
            }}
            muiTablePaperProps={{
              sx: {
                borderRadius: 3,
                boxShadow: 3,
                overflow: 'hidden',
              },
            }}

            // Head / Body
            muiTableHeadCellProps={{
              sx: {
                fontWeight: 700,
                backgroundColor: (t) =>
                  t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.background.paper,
              },
            }}
            muiTableBodyRowProps={{
              sx: {
                '&:hover': { backgroundColor: (t) => t.palette.action.hover },
              },
            }}

            // Paginación
            muiPaginationProps={{
              rowsPerPageOptions: [5, 10, 20],
              shape: 'rounded',
              size: 'small',
            }}
          />
        </Box>
      </DashboardCard>
    </PageContainer>
  );
}
