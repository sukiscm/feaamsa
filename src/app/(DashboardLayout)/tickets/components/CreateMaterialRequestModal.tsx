// src/app/(DashboardLayout)/tickets/components/CreateMaterialRequestModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Autocomplete,
  IconButton,
  Typography,
  Box,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Card,
  CardContent,
  Stack,
} from '@mui/material';
import { IconTrash, IconPlus, IconTemplate } from '@tabler/icons-react';
import { useItems, type Item } from '@/app/hooks/useItems';
import { usePresets, getPresetWithDetails, type PresetWithDetails } from '@/app/hooks/usePresets';

interface MaterialRequestItemForm {
  item: Item | null;
  quantityRequested: number;
  notes?: string;
}

interface CreateMaterialRequestModalProps {
  open: boolean;
  onClose: () => void;
  ticketId: string;
  ticketTitle: string;
  onSuccess: () => void;
}

export default function CreateMaterialRequestModal({
  open,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess,
}: CreateMaterialRequestModalProps) {
  const { data: items, loading: loadingItems } = useItems();
  const { data: presets, loading: loadingPresets } = usePresets();

  const [requestItems, setRequestItems] = useState<MaterialRequestItemForm[]>([
    { item: null, quantityRequested: 1 },
  ]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(true);

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [originalPresetItems, setOriginalPresetItems] = useState<MaterialRequestItemForm[]>([]);

  useEffect(() => {
    if (open) {
      setRequestItems([{ item: null, quantityRequested: 1 }]);
      setNotes('');
      setError(null);
      setShowPresets(true);
    }
  }, [open]);

  const handleAddItem = () => {
    setRequestItems([...requestItems, { item: null, quantityRequested: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setRequestItems(requestItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...requestItems];
    updated[index] = { ...updated[index], [field]: value };
    setRequestItems(updated);
  };

  // 👇 NUEVA FUNCIÓN: Cargar preset
  const handleLoadPreset = async (presetId: string) => {
    try {
      setLoading(true);
      const preset: PresetWithDetails = await getPresetWithDetails(presetId);
      
      const presetItems: MaterialRequestItemForm[] = preset.itemsWithDetails.map((pi) => ({
        item: pi.item as Item,
        quantityRequested: pi.quantity,
        notes: pi.notes || '',
      }));

      setRequestItems(presetItems);
      setOriginalPresetItems(JSON.parse(JSON.stringify(presetItems))); // 👈 Copiar para comparar
      setSelectedPresetId(presetId); // 👈 Guardar ID del preset
      setNotes(`📋 Preset aplicado: ${preset.name}\n${preset.description || ''}`);
      setShowPresets(false);
      setError(null);
    } catch (err: any) {
      setError('Error al cargar preset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const checkIfModified = (): boolean => {
    if (!selectedPresetId || originalPresetItems.length === 0) {
      return false;
    }

    // Verificar si cambió la cantidad de items
    if (requestItems.length !== originalPresetItems.length) {
      return true;
    }

    // Verificar cada item
    for (let i = 0; i < requestItems.length; i++) {
      const current = requestItems[i];
      const original = originalPresetItems[i];

      // Item diferente
      if (current.item?.id !== original.item?.id) {
        return true;
      }

      // Cantidad diferente
      if (current.quantityRequested !== original.quantityRequested) {
        return true;
      }
    }

    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validItems = requestItems.filter((ri) => ri.item && ri.quantityRequested > 0);

    if (validItems.length === 0) {
      setError('Debes agregar al menos un item');
      return;
    }

    setLoading(true);

    try {
      // 👇 ACTUALIZADO: Incluir tracking de preset
      const payload = {
        ticketId,
        items: validItems.map((ri) => ({
          itemId: ri.item!.id,
          quantityRequested: ri.quantityRequested,
          notes: ri.notes || undefined,
        })),
        notes: notes || undefined,
        fromPresetId: selectedPresetId || undefined, // 👈 NUEVO
        wasModifiedFromPreset: checkIfModified(), // 👈 NUEVO
      };

      console.log('📦 Payload con tracking:', {
        ...payload,
        wasModified: payload.wasModifiedFromPreset,
      });

      const response = await fetch('/api/material-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error al crear la solicitud');
      }

      const result = await response.json();
      console.log('✅ Requisición creada con tracking:', {
        id: result.id,
        folio: result.folio,
        fromPreset: result.fromPreset?.name,
        wasModified: result.wasModifiedFromPreset,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al crear la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const renderModificationIndicator = () => {
    if (!selectedPresetId) return null;

    const wasModified = checkIfModified();

    return (
      <Alert 
        severity={wasModified ? 'warning' : 'info'} 
        sx={{ mb: 2 }}
        icon={wasModified ? '⚠️' : 'ℹ️'}
      >
        {wasModified ? (
          <>
            <strong>Preset modificado:</strong> Has realizado cambios respecto al preset original
          </>
        ) : (
          <>
            <strong>Preset sin modificar:</strong> Usando configuración original del preset
          </>
        )}
      </Alert>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box>
            <Typography variant="h5">📋 Solicitar Materiales</Typography>
            <Typography variant="body2" color="text.secondary">
              Ticket: {ticketTitle}
            </Typography>
          </Box>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ pt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* 👇 NUEVA SECCIÓN: Presets */}
          {renderModificationIndicator()}
          {showPresets && !loadingPresets && presets.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <IconTemplate size={20} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Plantillas Rápidas
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {presets.map((preset) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={preset.id}>
                    <Card onClick={() => handleLoadPreset(preset.id)}>
                      <CardContent>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {preset.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {preset.description}
                          </Typography>

                          {/* 👇 NUEVO: Preview de items */}
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                              Incluye:
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {preset.items.slice(0, 3).map((item, idx) => (
                                <Chip
                                  key={idx}
                                  label={`${item.quantity}x`}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                              {preset.items.length > 3 && (
                                <Chip
                                  label={`+${preset.items.length - 3} más`}
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                />
                              )}
                            </Box>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="body2" color="text.secondary" align="center">
                O agrega items manualmente
              </Typography>
            </Box>
          )}

          {loadingItems || loadingPresets ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Items Solicitados
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {!showPresets && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<IconTemplate size={18} />}
                        onClick={() => setShowPresets(true)}
                        disabled={loading}
                      >
                        Ver Plantillas
                      </Button>
                    )}
                    <Button
                      size="small"
                      startIcon={<IconPlus size={18} />}
                      onClick={handleAddItem}
                      disabled={loading}
                    >
                      Agregar Item
                    </Button>
                  </Stack>
                </Box>

                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell width={120}>Cantidad</TableCell>
                      <TableCell width={200}>Notas</TableCell>
                      <TableCell width={60}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requestItems.map((requestItem, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Autocomplete
                            size="small"
                            options={items}
                            value={requestItem.item}
                            onChange={(e, newValue) => handleItemChange(index, 'item', newValue)}
                            getOptionLabel={(option) => option.descripcion}
                            renderOption={(props, option) => (
                              <Box component="li" {...props}>
                                <Box>
                                  <Typography variant="body2">{option.descripcion}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {option.categoria} • Stock: {option.inventario}
                                  </Typography>
                                </Box>
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder="Seleccionar item"
                                required
                              />
                            )}
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            value={requestItem.quantityRequested}
                            onChange={(e) =>
                              handleItemChange(index, 'quantityRequested', parseInt(e.target.value) || 1)
                            }
                            inputProps={{ min: 1 }}
                            required
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            value={requestItem.notes || ''}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            placeholder="Opcional"
                            disabled={loading}
                          />
                        </TableCell>
                        <TableCell>
                          {requestItems.length > 1 && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoveItem(index)}
                              disabled={loading}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <TextField
                label="Observaciones Generales"
                multiline
                rows={3}
                fullWidth
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Agregar observaciones sobre esta solicitud (opcional)"
                disabled={loading}
              />
            </>
          )}
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} variant="outlined">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || loadingItems}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Creando...' : 'Crear Solicitud'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}