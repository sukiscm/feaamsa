// src/app/(DashboardLayout)/admin/presets/components/PresetForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Autocomplete,
  FormControlLabel,
  Switch,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { IconTrash, IconPlus } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useItems, type Item } from '@/app/hooks/useItems';
import { PresetType, type Preset } from '@/app/hooks/usePresets';

interface PresetFormItem {
  item: Item | null;
  quantity: number;
  notes: string;
}

interface PresetFormProps {
  preset?: Preset;
  mode: 'create' | 'edit';
}

export default function PresetForm({ preset, mode }: PresetFormProps) {
  const router = useRouter();
  const { data: items, loading: loadingItems } = useItems();

  const [name, setName] = useState(preset?.name || '');
  const [type, setType] = useState<string>(preset?.type || PresetType.MANTENIMIENTO_GENERAL);
  const [description, setDescription] = useState(preset?.description || '');
  const [active, setActive] = useState(preset?.active ?? true);
  const [presetItems, setPresetItems] = useState<PresetFormItem[]>([
    { item: null, quantity: 1, notes: '' }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && preset && items.length > 0) {
      const loadedItems = preset.items.map((pi) => ({
        item: items.find((i) => i.id === pi.itemId) || null,
        quantity: pi.quantity,
        notes: pi.notes || '',
      }));
      setPresetItems(loadedItems);
    }
  }, [mode, preset, items]);

  const handleAddItem = () => {
    setPresetItems([...presetItems, { item: null, quantity: 1, notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (presetItems.length === 1) {
      setError('Debe haber al menos un item');
      return;
    }
    setPresetItems(presetItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, item: Item | null) => {
    const updated = [...presetItems];
    updated[index].item = item;
    setPresetItems(updated);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    const updated = [...presetItems];
    updated[index].quantity = Math.max(1, quantity);
    setPresetItems(updated);
  };

  const handleNotesChange = (index: number, notes: string) => {
    const updated = [...presetItems];
    updated[index].notes = notes;
    setPresetItems(updated);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    const validItems = presetItems.filter((pi) => pi.item !== null);
    if (validItems.length === 0) {
      setError('Debe agregar al menos un item');
      return false;
    }

    const itemIds = validItems.map((pi) => pi.item!.id);
    const duplicates = itemIds.filter((id, index) => itemIds.indexOf(id) !== index);
    if (duplicates.length > 0) {
      setError('No puede agregar el mismo item dos veces');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    const validItems = presetItems.filter((pi) => pi.item !== null);

    const payload = {
      name: name.trim(),
      type,
      description: description.trim() || undefined,
      active,
      items: validItems.map((pi) => ({
        itemId: pi.item!.id,
        quantity: pi.quantity,
        notes: pi.notes.trim() || undefined,
      })),
    };

    setLoading(true);

    try {
      const url = mode === 'create' 
        ? '/api/material-requests/presets' 
        : `/api/material-requests/presets/${preset!.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PATCH';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Error al ${mode === 'create' ? 'crear' : 'actualizar'} preset`);
      }

      const result = await response.json();
      console.log('✅ Preset guardado:', result);

      router.push('/admin/presets');
    } catch (err: any) {
      setError(err.message || `Error al ${mode === 'create' ? 'crear' : 'actualizar'} preset`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* Información Básica */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            📋 Información Básica
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nombre del Preset"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej: Mantenimiento AC Básico"
                helperText="Nombre descriptivo y único"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Preset</InputLabel>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  label="Tipo de Preset"
                >
                  <MenuItem value={PresetType.MANTENIMIENTO_GENERAL}>
                    Mantenimiento General
                  </MenuItem>
                  <MenuItem value={PresetType.INSTALACION_MINISPLIT}>
                    Instalación Minisplit
                  </MenuItem>
                  <MenuItem value={PresetType.REPARACION_URGENTE}>
                    Reparación Urgente
                  </MenuItem>
                  <MenuItem value={PresetType.LIMPIEZA_PREVENTIVA}>
                    Limpieza Preventiva
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                label="Descripción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Descripción detallada del preset y cuándo usarlo..."
              />
            </Grid>

            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    color="primary"
                  />
                }
                label="Preset activo (visible para usuarios)"
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Items del Preset */}
        <Paper sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">
              📦 Items del Preset
            </Typography>
            <Button
              variant="outlined"
              startIcon={<IconPlus size={18} />}
              onClick={handleAddItem}
              disabled={loadingItems}
            >
              Agregar Item
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell width={120}>Cantidad</TableCell>
                <TableCell width={100}>Stock</TableCell>
                <TableCell width={200}>Notas</TableCell>
                <TableCell width={60}></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {presetItems.map((presetItem, index) => {
                const hasStock = presetItem.item && presetItem.item.inventario >= presetItem.quantity;
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <Autocomplete
                        options={items}
                        getOptionLabel={(option) => option.descripcion}
                        value={presetItem.item}
                        onChange={(_, newValue) => handleItemChange(index, newValue)}
                        loading={loadingItems}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Item"
                            required
                            placeholder="Buscar item..."
                            size="small"
                          />
                        )}
                        renderOption={(props, option) => {
                          const { key, ...optionProps } = props;
                          return (
                            <Box key={key} component="li" {...optionProps}>
                              <Box>
                                <Typography variant="body2">
                                  {option.descripcion}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.categoria} | Stock: {option.inventario}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        }}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                      />
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        type="number"
                        size="small"
                        value={presetItem.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                        inputProps={{ min: 1 }}
                        required
                      />
                    </TableCell>

                    <TableCell>
                      {presetItem.item && (
                        <Chip
                          label={presetItem.item.inventario}
                          size="small"
                          color={hasStock ? 'success' : 'error'}
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={presetItem.notes}
                        onChange={(e) => handleNotesChange(index, e.target.value)}
                        placeholder="Opcional..."
                      />
                    </TableCell>

                    <TableCell>
                      {presetItems.length > 1 && (
                        <Tooltip title="Eliminar item">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveItem(index)}
                            disabled={presetItems.length === 1}
                            size="small"
                          >
                            <IconTrash size={20} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {presetItems.filter((pi) => pi.item).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Agrega al menos un item al preset
            </Alert>
          )}
        </Paper>

        {/* Botones de Acción */}
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => router.push('/admin/presets')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingItems}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading 
              ? (mode === 'create' ? 'Creando...' : 'Guardando...') 
              : (mode === 'create' ? 'Crear Preset' : 'Guardar Cambios')
            }
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}