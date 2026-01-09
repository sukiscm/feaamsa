// src/app/(DashboardLayout)/catalog/locations/LocationModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Typography,
  Chip,
  Grid,
} from '@mui/material';
import { Location } from '@/app/hooks/useLocations';

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (location: Partial<Location>) => Promise<void>;
  location?: Location | null;
  mode: 'create' | 'edit';
}

const TIPOS = [
  { value: 'ALMACEN', label: '📦 Almacén', color: 'primary' },
  { value: 'TALLER', label: '🔧 Taller', color: 'info' },
  { value: 'OFICINA', label: '🏢 Oficina', color: 'secondary' },
  { value: 'SUCURSAL', label: '🏪 Sucursal', color: 'success' },
  { value: 'OTRO', label: '📍 Otro', color: 'default' },
];

const STATUS_OPTIONS = [
  { value: 'ACTIVA', label: 'Activa', color: 'success' },
  { value: 'INACTIVA', label: 'Inactiva', color: 'error' },
];

export default function LocationModal({ open, onClose, onSave, location, mode }: LocationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: '',
    codigo: '',
    tipo: 'ALMACEN',
    status: 'ACTIVA',
    direccion: '',
    notas: '',
  });

  useEffect(() => {
    if (location && mode === 'edit') {
      setFormData({
        nombre: location.nombre || '',
        codigo: location.codigo || '',
        tipo: location.tipo || 'ALMACEN',
        status: location.status || 'ACTIVA',
        direccion: location.direccion || '',
        notas: location.notas || '',
      });
    } else if (mode === 'create') {
      setFormData({
        nombre: '',
        codigo: '',
        tipo: 'ALMACEN',
        status: 'ACTIVA',
        direccion: '',
        notas: '',
      });
    }
    setError(null);
  }, [location, mode, open]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio');
      return;
    }

    setLoading(true);

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la ubicación');
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
            {mode === 'create' ? '➕ Crear Nueva Ubicación' : '✏️ Editar Ubicación'}
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

          {/* Nombre */}
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField
              label="Nombre de la Ubicación"
              fullWidth
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Almacén Principal Veracruz"
              disabled={loading}
              required
              helperText="Nombre descriptivo de la ubicación"
            />
          </Grid>

          {/* Código */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Código"
              fullWidth
              value={formData.codigo}
              onChange={(e) => handleChange('codigo', e.target.value.toUpperCase())}
              placeholder="ALM-VER-01"
              disabled={loading}
              helperText="Código único (opcional)"
            />
          </Grid>

          {/* Tipo y Status */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Tipo de Ubicación"
              fullWidth
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              disabled={loading}
            >
              {TIPOS.map((tipo) => (
                <MenuItem key={tipo.value} value={tipo.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={tipo.label} 
                      size="small" 
                      color={tipo.color as any}
                      variant="outlined"
                    />
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Estado"
              fullWidth
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              disabled={loading}
            >
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Chip 
                    label={status.label} 
                    size="small" 
                    color={status.color as any}
                  />
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Sección: Detalles Adicionales */}
          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 1 }} />
            <Typography variant="subtitle2" color="primary" gutterBottom>
              📍 Detalles Adicionales
            </Typography>
          </Grid>

          {/* Dirección */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Dirección"
              fullWidth
              multiline
              rows={2}
              value={formData.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              placeholder="Dirección física de la ubicación"
              disabled={loading}
            />
          </Grid>

          {/* Notas */}
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notas"
              fullWidth
              multiline
              rows={3}
              value={formData.notas}
              onChange={(e) => handleChange('notas', e.target.value)}
              placeholder="Información adicional, horarios, responsables, etc."
              disabled={loading}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Guardando...' : mode === 'create' ? 'Crear' : 'Guardar Cambios'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}