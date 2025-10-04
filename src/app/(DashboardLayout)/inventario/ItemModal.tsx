// src/app/(DashboardLayout)/inventario/ItemModal.tsx
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
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Typography,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Item } from '@/app/hooks/useItems';

interface ItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: Partial<Item>) => Promise<void>;
  item?: Item | null;
  mode: 'create' | 'edit';
}

const CATEGORIAS = [
  { value: 'EPP', label: 'EPP - Equipo de Protección Personal' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'EQUIPO', label: 'Equipo' },
  { value: 'HERRAMIENTA', label: 'Herramienta' },
  { value: 'ALIMENTICIA', label: 'Alimenticia' },
  { value: 'EQUIPOS DE SEGURIDAD', label: 'Equipos de Seguridad' },
  { value: 'Consumibles', label: 'Consumibles' },
  { value: 'Refrigerante', label: 'Refrigerante' },
  { value: 'Electrónica', label: 'Electrónica' },
];

const STATUS_OPTIONS = [
  { value: 'EN OPERACIÓN', label: 'En Operación', color: 'success' },
  { value: 'MANTENIMIENTO', label: 'Mantenimiento', color: 'warning' },
  { value: 'FUERA DE SERVICIO', label: 'Fuera de Servicio', color: 'error' },
  { value: 'BAJA', label: 'Baja', color: 'default' },
];

const PROCESOS = [
  'OPERACIONES',
  'MANTENIMIENTO',
  'ADMINISTRACIÓN',
];

export default function ItemModal({ open, onClose, onSave, item, mode }: ItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    descripcion: '',
    serie: 'S/N',
    categoria: '',
    proceso: 'OPERACIONES',
    status: 'EN OPERACIÓN',
    inventario: 0,
    activo: true,
  });

  // Cargar datos del item si estamos editando
  useEffect(() => {
    if (item && mode === 'edit') {
      setFormData({
        descripcion: item.descripcion || '',
        serie: item.serie || 'S/N',
        categoria: item.categoria || '',
        proceso: item.proceso || 'OPERACIONES',
        status: item.status || 'EN OPERACIÓN',
        inventario: item.inventario || 0,
        activo: item.activo ?? true,
      });
    } else if (mode === 'create') {
      // Reset form para crear nuevo
      setFormData({
        descripcion: '',
        serie: 'S/N',
        categoria: '',
        proceso: 'OPERACIONES',
        status: 'EN OPERACIÓN',
        inventario: 0,
        activo: true,
      });
    }
    setError(null);
  }, [item, mode, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.descripcion.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    if (!formData.categoria) {
      setError('La categoría es obligatoria');
      return;
    }

    if (formData.inventario < 0) {
      setError('El inventario no puede ser negativo');
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar el item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        component: 'form',
        onSubmit: handleSubmit,
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h5" component="span">
            {mode === 'create' ? '➕ Crear Nuevo Item' : '✏️ Editar Item'}
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

        <Grid container spacing={3}>
          {/* Sección: Información General */}
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              📋 Información General
            </Typography>
          </Grid>

          {/* Descripción - Ancho completo */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Descripción del Item"
              fullWidth
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Ej: FILTRO DE AIRE AC CARRIER 24000 BTU"
              disabled={loading}
              required
              helperText="Descripción detallada del item"
            />
          </Grid>

          {/* Serie y Categoría en fila */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Serie / Número de Parte"
              fullWidth
              value={formData.serie}
              onChange={(e) => handleChange('serie', e.target.value)}
              placeholder="S/N"
              disabled={loading}
              helperText="Serie del fabricante o código interno"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={CATEGORIAS}
              value={CATEGORIAS.find(c => c.value === formData.categoria) || null}
              onChange={(e, newValue) => handleChange('categoria', newValue?.value || '')}
              getOptionLabel={(option) => option.label}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Categoría"
                  required
                  helperText="Tipo de item"
                  disabled={loading}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Chip 
                    label={option.value} 
                    size="small" 
                    sx={{ mr: 1 }} 
                  />
                  {option.label}
                </Box>
              )}
            />
          </Grid>

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" gutterBottom>
              ⚙️ Estado y Operación
            </Typography>
          </Grid>

          {/* Proceso y Estado */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Proceso"
              select
              fullWidth
              value={formData.proceso}
              onChange={(e) => handleChange('proceso', e.target.value)}
              disabled={loading}
              helperText="Área o departamento responsable"
            >
              {PROCESOS.map((proc) => (
                <MenuItem key={proc} value={proc}>
                  {proc}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Estado Operacional"
              select
              fullWidth
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={loading}
              helperText="Estado actual del item"
            >
              {STATUS_OPTIONS.map((st) => (
                <MenuItem key={st.value} value={st.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={st.label} 
                      color={st.color as any} 
                      size="small" 
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Divider */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" gutterBottom>
              📦 Inventario
            </Typography>
          </Grid>

          {/* Inventario y Switch */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Cantidad en Stock"
              type="number"
              fullWidth
              value={formData.inventario}
              onChange={(e) => handleChange('inventario', parseInt(e.target.value) || 0)}
              disabled={loading}
              inputProps={{ min: 0 }}
              helperText="Cantidad disponible actualmente"
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <Box 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 1,
                px: 2
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.activo}
                    onChange={(e) => handleChange('activo', e.target.checked)}
                    disabled={loading}
                    color="success"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {formData.activo ? '✅ Item Activo' : '⛔ Item Inactivo'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formData.activo ? 'Disponible para uso' : 'No disponible'}
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} variant="outlined">
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear Item' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}