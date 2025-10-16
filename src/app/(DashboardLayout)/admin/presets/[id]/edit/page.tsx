// src/app/(DashboardLayout)/admin/presets/[id]/edit/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Typography, Box, Button, Alert, CircularProgress } from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import { useParams, useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import PresetForm from '../../components/PresetForm';
import { type Preset } from '@/app/hooks/usePresets';

export default function EditPresetPage() {
  const params = useParams();
  const router = useRouter();
  const presetId = params.id as string;

  const [preset, setPreset] = useState<Preset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreset();
  }, [presetId]);

  const loadPreset = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/material-requests/presets/${presetId}`);
      if (!response.ok) throw new Error('Error al cargar preset');
      const data = await response.json();
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
        <Box mt={2}>
          <Button onClick={() => router.push('/admin/presets')}>
            Volver a Presets
          </Button>
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={`Editar - ${preset.name}`} description="Modificar plantilla">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push(`/admin/presets/${presetId}`)}
          variant="outlined"
          size="small"
        >
          Volver al Detalle
        </Button>
      </Box>

      <DashboardCard title={`✏️ Editar Preset: ${preset.name}`}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Modifica los items, cantidades o información del preset. Los cambios se aplicarán 
            a futuras requisiciones creadas con este preset.
          </Typography>
        </Box>

        <PresetForm mode="edit" preset={preset} />
      </DashboardCard>
    </PageContainer>
  );
}