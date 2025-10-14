// src/app/(DashboardLayout)/admin/presets/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Stack,
} from '@mui/material';
import { IconArrowLeft, IconEdit } from '@tabler/icons-react';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { getPresetWithDetails, type PresetWithDetails } from '@/app/hooks/usePresets';

export default function PresetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const presetId = params.id as string;

  const [preset, setPreset] = useState<PresetWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreset();
  }, [presetId]);

  const loadPreset = async () => {
    setLoading(true);
    try {
      const data = await getPresetWithDetails(presetId);
      setPreset(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <PageContainer title="Cargando..." description="">
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (error || !preset) {
    return (
      <PageContainer title="Error" description="">
        <Alert severity="error">{error || 'Preset no encontrado'}</Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Preset - ${preset.name}`} description="Detalle de plantilla">
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/admin/presets')}
          variant="outlined"
          size="small"
        >
          Volver
        </Button>
        <Button
          startIcon={<IconEdit size={18} />}
          onClick={() => router.push(`/admin/presets/${preset.id}/edit`)}
          variant="contained"
          size="small"
        >
          Editar Preset
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {/* Info principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <DashboardCard title={`🎯 ${preset.name}`}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Tipo
                </Typography>
                <Box mt={0.5}>
                  <Chip label={preset.type} color="info" />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box mt={0.5}>
                  <Chip
                    label={preset.active ? 'Activo' : 'Inactivo'}
                    color={preset.active ? 'success' : 'default'}
                  />
                </Box>
              </Grid>

              {preset.description && (
                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Descripción
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    {preset.description}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </DashboardCard>

          {/* Items del preset */}
          <Box mt={3}>
            <DashboardCard /* title={`📦 Items (${preset.itemsWithDetails.length})`} */>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="center">Cantidad</TableCell>
                    <TableCell align="center">Stock</TableCell>
                    <TableCell>Notas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {preset.itemsWithDetails.map((pi, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2">
                          {pi.item.descripcion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={pi.item.categoria || '—'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={pi.quantity}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={pi.item.inventario}
                          size="small"
                          color={pi.item.inventario >= pi.quantity ? 'success' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {pi.notes || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DashboardCard>
          </Box>
        </Grid>

        {/* Info lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Información
              </Typography>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Creado
                </Typography>
                <Typography variant="body2">
                  {new Date(preset.createdAt).toLocaleString('es-MX')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Última actualización
                </Typography>
                <Typography variant="body2">
                  {new Date(preset.updatedAt).toLocaleString('es-MX')}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Validación de stock */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✅ Validación
              </Typography>
              {preset.itemsWithDetails.every(
                (pi) => pi.item.inventario >= pi.quantity
              ) ? (
                <Alert severity="success">
                  Todos los items tienen stock suficiente
                </Alert>
              ) : (
                <Alert severity="warning">
                  Algunos items tienen stock insuficiente
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageContainer>
  );
}