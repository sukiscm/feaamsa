// src/app/(DashboardLayout)/inventory/stock-location/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  IconButton,
  Collapse,
  Chip,
  Typography,
  Stack,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  IconChevronDown,
  IconChevronUp,
  IconPlus,
  IconMinus,
  IconEdit,
  IconSearch,
  IconRefresh,
  IconPackage,
  IconAlertCircle,
  IconCircleCheck,
} from '@tabler/icons-react';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

// ============================================
// TIPOS
// ============================================

interface Item {
  id: string;
  descripcion: string;
  categoria: string;
  status: string;
}

interface Location {
  id: string;
  nombre: string;
  codigo: string;
  tipo: string;
  status: string;
}

interface InventoryRecord {
  id: string;
  cantidad: string;
  item: Item;
  location: Location;
  updatedAt: string;
}

interface StockByItem {
  item: Item;
  totalStock: number;
  locations: {
    location: Location;
    stock: number;
    inventoryId: string;
  }[];
}

interface Movement {
  id: string;
  tipo: 'IN' | 'OUT' | 'ADJUST';
  cantidad: string;
  saldoDespues: string;
  comentario?: string;
  createdAt: string;
  location: Location;
  user: { name: string };
}

// ============================================
// COMPONENTE FILA EXPANDIBLE
// ============================================

interface StockRowProps {
  row: StockByItem;
  isExpanded: boolean;
  onToggle: () => void;
  onMovement: (
    type: 'IN' | 'OUT' | 'ADJUST',
    itemId: string,
    locationId: string,
    itemName: string,
    locationName: string,
    currentStock: number
  ) => void;
  onHistory: (itemId: string, itemName: string) => void;
  onAddLocation: (itemId: string, itemName: string, existingLocationIds: string[]) => void;
}

function StockRow({ row, isExpanded, onToggle, onMovement, onHistory, onAddLocation }: StockRowProps) {
  const getStockColor = (stock: number) => {
    if (stock === 0) return 'error';
    if (stock < 10) return 'warning';
    return 'success';
  };

  return (
    <>
      {/* FILA PRINCIPAL */}
      <TableRow hover>
        <TableCell width={50}>
          <IconButton size="small" onClick={onToggle}>
            {isExpanded ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {row.item.descripcion}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip label={row.item.categoria} size="small" variant="outlined" />
        </TableCell>
        <TableCell align="center">
          <Chip
            label={row.totalStock.toFixed(2)}
            color={getStockColor(row.totalStock)}
            size="small"
          />
        </TableCell>
        <TableCell align="center">
          <Chip label={row.locations.length} size="small" />
        </TableCell>
        <TableCell>
          <Chip
            label={row.item.status}
            size="small"
            color={row.item.status === 'EN OPERACIÓN' ? 'success' : 'default'}
          />
        </TableCell>
        <TableCell align="center">
          <Button
            size="small"
            variant="outlined"
            onClick={() => onHistory(row.item.id, row.item.descripcion)}
          >
            Historial
          </Button>
        </TableCell>
      </TableRow>

      {/* FILA EXPANDIDA */}
      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, border: 0 }}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                Stock por Ubicación
              </Typography>

              {row.locations.length === 0 ? (
                <Alert severity="info">No hay stock registrado en ninguna ubicación</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Ubicación</TableCell>
                      <TableCell>Código</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell align="center">Stock</TableCell>
                      <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.locations.map((loc) => (
                      <TableRow key={loc.inventoryId}>
                        <TableCell>{loc.location.nombre}</TableCell>
                        <TableCell>
                          <Chip label={loc.location.codigo} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip label={loc.location.tipo} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={loc.stock.toFixed(2)}
                            color={getStockColor(loc.stock)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<IconPlus size={16} />}
                              onClick={() =>
                                onMovement(
                                  'IN',
                                  row.item.id,
                                  loc.location.id,
                                  row.item.descripcion,
                                  loc.location.nombre,
                                  loc.stock
                                )
                              }
                            >
                              IN
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<IconMinus size={16} />}
                              onClick={() =>
                                onMovement(
                                  'OUT',
                                  row.item.id,
                                  loc.location.id,
                                  row.item.descripcion,
                                  loc.location.nombre,
                                  loc.stock
                                )
                              }
                              disabled={loc.stock === 0}
                            >
                              OUT
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="info"
                              startIcon={<IconEdit size={16} />}
                              onClick={() =>
                                onMovement(
                                  'ADJUST',
                                  row.item.id,
                                  loc.location.id,
                                  row.item.descripcion,
                                  loc.location.nombre,
                                  loc.stock
                                )
                              }
                            >
                              Ajustar
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {/* Botón para agregar a nueva ubicación */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<IconPlus size={16} />}
                  onClick={() => {
                    const existingIds = row.locations.map((loc) => loc.location.id);
                    onAddLocation(row.item.id, row.item.descripcion, existingIds);
                  }}
                >
                  Agregar a Nueva Ubicación
                </Button>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function StockLocationPage() {
  // Estados principales
  const [stockData, setStockData] = useState<StockByItem[]>([]);
  const [filteredData, setFilteredData] = useState<StockByItem[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'zero'>('all');

  // Estados de UI
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [movementDialog, setMovementDialog] = useState<{
    open: boolean;
    itemId?: string;
    locationId?: string;
    itemName?: string;
    locationName?: string;
    currentStock?: number;
    type?: 'IN' | 'OUT' | 'ADJUST';
  }>({ open: false });

  const [movementForm, setMovementForm] = useState({
    cantidad: '',
    comentario: '',
  });

  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    itemId?: string;
    itemName?: string;
  }>({ open: false });

  const [movements, setMovements] = useState<Movement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Estado para agregar a nueva ubicación
  const [addLocationDialog, setAddLocationDialog] = useState<{
    open: boolean;
    itemId?: string;
    itemName?: string;
    existingLocationIds?: string[];
  }>({ open: false });

  const [addLocationForm, setAddLocationForm] = useState({
    locationId: '',
    cantidad: '',
    comentario: '',
  });

  // ============================================
  // EFECTOS
  // ============================================

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [stockData, searchTerm, categoryFilter, locationFilter, stockFilter]);

  // ============================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [inventoryRes, locationsRes] = await Promise.all([
        fetch('/api/inventory'),
        fetch('/api/locations'),
      ]);

      if (!inventoryRes.ok || !locationsRes.ok) {
        throw new Error('Error al cargar datos');
      }

      const inventory: InventoryRecord[] = await inventoryRes.json();
      const locs: Location[] = await locationsRes.json();

      setLocations(locs);

      // Agrupar inventario por item
      const grouped = groupInventoryByItem(inventory);
      setStockData(grouped);
      setFilteredData(grouped);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const groupInventoryByItem = (inventory: InventoryRecord[]): StockByItem[] => {
    const itemMap = new Map<string, StockByItem>();

    inventory.forEach((inv) => {
      const itemId = inv.item.id;

      if (!itemMap.has(itemId)) {
        itemMap.set(itemId, {
          item: inv.item,
          totalStock: 0,
          locations: [],
        });
      }

      const itemData = itemMap.get(itemId)!;
      const stock = parseFloat(inv.cantidad || '0');

      itemData.totalStock += stock;
      itemData.locations.push({
        location: inv.location,
        stock,
        inventoryId: inv.id,
      });
    });

    return Array.from(itemMap.values()).sort((a, b) =>
      a.item.descripcion.localeCompare(b.item.descripcion)
    );
  };

  // ============================================
  // FUNCIONES DE FILTRADO
  // ============================================

  const applyFilters = () => {
    let filtered = [...stockData];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        item.item.descripcion.toLowerCase().includes(term)
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((item) => item.item.categoria === categoryFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter((item) =>
        item.locations.some((loc) => loc.location.id === locationFilter)
      );
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter((item) => item.totalStock > 0 && item.totalStock < 10);
    } else if (stockFilter === 'zero') {
      filtered = filtered.filter((item) => item.totalStock === 0);
    }

    setFilteredData(filtered);
  };

  // ============================================
  // FUNCIONES DE MOVIMIENTOS
  // ============================================

  const handleOpenMovement = (
    type: 'IN' | 'OUT' | 'ADJUST',
    itemId: string,
    locationId: string,
    itemName: string,
    locationName: string,
    currentStock: number
  ) => {
    setMovementDialog({
      open: true,
      type,
      itemId,
      locationId,
      itemName,
      locationName,
      currentStock,
    });
    setMovementForm({ cantidad: '', comentario: '' });
  };

  const handleCloseMovement = () => {
    setMovementDialog({ open: false });
    setMovementForm({ cantidad: '', comentario: '' });
  };

  const handleSubmitMovement = async () => {
    const { type, itemId, locationId } = movementDialog;
    const cantidad = parseFloat(movementForm.cantidad);

    if (!cantidad || cantidad <= 0) {
      alert('Cantidad inválida');
      return;
    }

    try {
      const endpoint =
        type === 'IN'
          ? '/api/inventory/in'
          : type === 'OUT'
          ? '/api/inventory/out'
          : '/api/inventory/adjust';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          locationId,
          cantidad,
          comentario: movementForm.comentario,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al registrar movimiento');
      }

      handleCloseMovement();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al registrar movimiento');
    }
  };

  // ============================================
  // FUNCIONES DE HISTORIAL
  // ============================================

  const handleOpenHistory = async (itemId: string, itemName: string) => {
    setHistoryDialog({ open: true, itemId, itemName });
    setMovements([]);
    setLoadingMovements(true);

    try {
      const res = await fetch(`/api/inventory/${itemId}/movements`);
      if (!res.ok) throw new Error('Error al cargar movimientos');
      
      const data = await res.json();
      setMovements(data);
    } catch (err) {
      console.error('Error loading movements:', err);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleCloseHistory = () => {
    setHistoryDialog({ open: false });
    setMovements([]);
  };

  // ============================================
  // FUNCIONES DE AGREGAR A NUEVA UBICACIÓN
  // ============================================

  const handleOpenAddLocation = (itemId: string, itemName: string, existingLocationIds: string[]) => {
    setAddLocationDialog({
      open: true,
      itemId,
      itemName,
      existingLocationIds,
    });
    setAddLocationForm({ locationId: '', cantidad: '', comentario: '' });
  };

  const handleCloseAddLocation = () => {
    setAddLocationDialog({ open: false });
    setAddLocationForm({ locationId: '', cantidad: '', comentario: '' });
  };

  const handleSubmitAddLocation = async () => {
    const { itemId } = addLocationDialog;
    const { locationId, cantidad, comentario } = addLocationForm;

    if (!locationId) {
      alert('Selecciona una ubicación');
      return;
    }

    const cantidadNum = parseFloat(cantidad);
    if (!cantidadNum || cantidadNum <= 0) {
      alert('Cantidad inválida');
      return;
    }

    try {
      const res = await fetch('/api/inventory/in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId,
          locationId,
          cantidad: cantidadNum,
          comentario: comentario || 'Stock inicial en nueva ubicación',
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Error al agregar stock');
      }

      handleCloseAddLocation();
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al agregar stock');
    }
  };

  const getAvailableLocations = () => {
    const existingIds = addLocationDialog.existingLocationIds || [];
    return locations.filter((loc) => !existingIds.includes(loc.id) && loc.status === 'ACTIVA');
  };

  // ============================================
  // FUNCIONES DE UI
  // ============================================

  const toggleRow = (itemId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedRows(newExpanded);
  };

  const getCategories = () => {
    const cats = new Set(stockData.map((item) => item.item.categoria));
    return Array.from(cats).sort();
  };

  const getMovementIcon = (type: string) => {
    if (type === 'IN') return <IconPlus size={16} />;
    if (type === 'OUT') return <IconMinus size={16} />;
    return <IconEdit size={16} />;
  };

  const getMovementColor = (type: string): 'success' | 'error' | 'info' => {
    if (type === 'IN') return 'success';
    if (type === 'OUT') return 'error';
    return 'info';
  };

  // ============================================
  // RENDER
  // ============================================

  if (loading && stockData.length === 0) {
    return (
      <PageContainer title="Stock por Ubicación" description="">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Stock por Ubicación" description="Gestión de inventario por ubicaciones">
      <DashboardCard title="">
        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconPackage size={28} />
            <Box>
              <Typography variant="h5">Gestión de Stock por Ubicación</Typography>
              <Typography variant="body2" color="text.secondary">
                Administra el inventario de cada item en todas las ubicaciones
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* FILTROS */}
        <Paper sx={{ p: 2, mb: 3 }} elevation={0} variant="outlined">
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                label="Buscar item"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconSearch size={18} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Categoría</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Categoría"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {getCategories().map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Ubicación</InputLabel>
                <Select
                  value={locationFilter}
                  label="Ubicación"
                  onChange={(e) => setLocationFilter(e.target.value)}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.nombre}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stock</InputLabel>
                <Select
                  value={stockFilter}
                  label="Stock"
                  onChange={(e) => setStockFilter(e.target.value as any)}
                >
                  <MenuItem value="all">Todo</MenuItem>
                  <MenuItem value="low">Stock Bajo (&lt;10)</MenuItem>
                  <MenuItem value="zero">Sin Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconRefresh size={18} />}
                onClick={loadData}
                disabled={loading}
              >
                Actualizar
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* ERROR */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* STATS */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
              <Typography variant="h4" color="primary">
                {filteredData.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Items Totales
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
              <Typography variant="h4" color="warning.main">
                {filteredData.filter((i) => i.totalStock < 10 && i.totalStock > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stock Bajo
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }} elevation={0} variant="outlined">
              <Typography variant="h4" color="error">
                {filteredData.filter((i) => i.totalStock === 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sin Stock
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* TABLA */}
        <TableContainer component={Paper} elevation={0} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width={50} />
                <TableCell>Item</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell align="center">Stock Total</TableCell>
                <TableCell align="center">Ubicaciones</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <StockRow
                  key={row.item.id}
                  row={row}
                  isExpanded={expandedRows.has(row.item.id)}
                  onToggle={() => toggleRow(row.item.id)}
                  onMovement={handleOpenMovement}
                  onHistory={handleOpenHistory}
                  onAddLocation={handleOpenAddLocation}
                />
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No se encontraron items</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* DIALOG - MOVIMIENTO */}
        <Dialog open={movementDialog.open} onClose={handleCloseMovement} maxWidth="sm" fullWidth>
          <DialogTitle>
            {movementDialog.type === 'IN' && 'Entrada de Stock'}
            {movementDialog.type === 'OUT' && 'Salida de Stock'}
            {movementDialog.type === 'ADJUST' && 'Ajuste de Stock'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Item:</strong> {movementDialog.itemName}
                </Typography>
                <Typography variant="body2">
                  <strong>Ubicación:</strong> {movementDialog.locationName}
                </Typography>
                <Typography variant="body2">
                  <strong>Stock Actual:</strong> {movementDialog.currentStock?.toFixed(2)}
                </Typography>
              </Alert>

              <TextField
                fullWidth
                label={movementDialog.type === 'ADJUST' ? 'Nueva Cantidad' : 'Cantidad'}
                type="number"
                value={movementForm.cantidad}
                onChange={(e) => setMovementForm({ ...movementForm, cantidad: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                helperText={
                  movementDialog.type === 'ADJUST'
                    ? 'Ingresa la cantidad final deseada'
                    : movementDialog.type === 'IN'
                    ? 'Cantidad a ingresar'
                    : 'Cantidad a retirar'
                }
              />

              <TextField
                fullWidth
                label="Comentario (opcional)"
                multiline
                rows={3}
                value={movementForm.comentario}
                onChange={(e) => setMovementForm({ ...movementForm, comentario: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMovement}>Cancelar</Button>
            <Button onClick={handleSubmitMovement} variant="contained" color="primary">
              Confirmar
            </Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG - HISTORIAL */}
        <Dialog open={historyDialog.open} onClose={handleCloseHistory} maxWidth="md" fullWidth>
          <DialogTitle>
            Historial de Movimientos
            <Typography variant="body2" color="text.secondary">
              {historyDialog.itemName}
            </Typography>
          </DialogTitle>
          <DialogContent>
            {loadingMovements ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : movements.length === 0 ? (
              <Alert severity="info">No hay movimientos registrados</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fecha</TableCell>
                      <TableCell>Tipo</TableCell>
                      <TableCell>Ubicación</TableCell>
                      <TableCell align="right">Cantidad</TableCell>
                      <TableCell align="right">Saldo</TableCell>
                      <TableCell>Usuario</TableCell>
                      <TableCell>Comentario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movements.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>{new Date(mov.createdAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            icon={getMovementIcon(mov.tipo)}
                            label={mov.tipo}
                            color={getMovementColor(mov.tipo)}
                          />
                        </TableCell>
                        <TableCell>{mov.location.nombre}</TableCell>
                        <TableCell align="right">{parseFloat(mov.cantidad).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          {parseFloat(mov.saldoDespues).toFixed(2)}
                        </TableCell>
                        <TableCell>{mov.user.name}</TableCell>
                        <TableCell>{mov.comentario || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseHistory}>Cerrar</Button>
          </DialogActions>
        </Dialog>

        {/* DIALOG - AGREGAR A NUEVA UBICACIÓN */}
        <Dialog open={addLocationDialog.open} onClose={handleCloseAddLocation} maxWidth="sm" fullWidth>
          <DialogTitle>Agregar Stock a Nueva Ubicación</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Item:</strong> {addLocationDialog.itemName}
                </Typography>
              </Alert>

              <FormControl fullWidth>
                <InputLabel>Ubicación</InputLabel>
                <Select
                  value={addLocationForm.locationId}
                  label="Ubicación"
                  onChange={(e) => setAddLocationForm({ ...addLocationForm, locationId: e.target.value })}
                >
                  {getAvailableLocations().length === 0 ? (
                    <MenuItem value="" disabled>
                      No hay ubicaciones disponibles
                    </MenuItem>
                  ) : (
                    getAvailableLocations().map((loc) => (
                      <MenuItem key={loc.id} value={loc.id}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loc.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {loc.codigo} - {loc.tipo}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Cantidad Inicial"
                type="number"
                value={addLocationForm.cantidad}
                onChange={(e) => setAddLocationForm({ ...addLocationForm, cantidad: e.target.value })}
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Stock inicial en esta nueva ubicación"
              />

              <TextField
                fullWidth
                label="Comentario (opcional)"
                multiline
                rows={3}
                value={addLocationForm.comentario}
                onChange={(e) => setAddLocationForm({ ...addLocationForm, comentario: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseAddLocation}>Cancelar</Button>
            <Button 
              onClick={handleSubmitAddLocation} 
              variant="contained" 
              color="primary"
              disabled={!addLocationForm.locationId || !addLocationForm.cantidad}
            >
              Agregar Stock
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardCard>
    </PageContainer>
  );
}