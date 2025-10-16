// src/app/(DashboardLayout)/admin/presets/new/page.tsx
'use client';

import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { IconArrowLeft } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import PresetForm from '../components/PresetForm';

export default function NewPresetPage() {
  const router = useRouter();

  return (
    <PageContainer title="Nuevo Preset" description="Crear plantilla de requisición">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/admin/presets')}
          variant="outlined"
          size="small"
        >
          Volver a Presets
        </Button>
      </Box>

      <DashboardCard title="🎯 Crear Nuevo Preset">
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Los presets permiten crear requisiciones rápidamente con items predefinidos. 
            Configura los items y cantidades que se usarán frecuentemente juntos.
          </Typography>
        </Box>

        <PresetForm mode="create" />
      </DashboardCard>
    </PageContainer>
  );
}