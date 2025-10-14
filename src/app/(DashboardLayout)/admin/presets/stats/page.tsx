// src/app/(DashboardLayout)/admin/presets/stats/page.tsx
'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  IconTrendingUp,
  IconEdit,
  IconCheck,
  IconTemplate,
  IconPackage,
} from '@tabler/icons-react';

import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { usePresetStats, useTopItemsFromPresets } from '@/app/hooks/usePresetsStats';

export default function PresetStatsPage() {
  const { data: statsData, loading: loadingStats, error: statsError } = usePresetStats();
  const { data: topItems, loading: loadingItems, error: itemsError } = useTopItemsFromPresets(10);

  if (loadingStats) {
    return (
      <PageContainer title="Estadísticas" description="Análisis de uso de presets">
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  if (statsError) {
    return (
      <PageContainer title="Estadísticas" description="Análisis de uso de presets">
        <Alert severity="error">{statsError}</Alert>
      </PageContainer>
    );
  }

  const { presetsWithStats, globalStats } = statsData || { presetsWithStats: [], globalStats: null };

  return (
    <PageContainer title="Estadísticas de Presets" description="Análisis de uso">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          📊 Estadísticas de Plantillas
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Análisis de uso y efectividad de las plantillas de requisiciones
        </Typography>
      </Box>

      {/* 👇 KPIs Globales */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'primary.light',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconTemplate size={32} color="#5D87FF" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {globalStats?.totalRequests || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Requisiciones
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'success.light',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconCheck size={32} color="#13DEB9" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {globalStats?.requestsFromPreset || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Desde Presets
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'warning.light',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconEdit size={32} color="#FFAE1F" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {globalStats?.requestsManual || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Manuales
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    bgcolor: 'info.light',
                    p: 1.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconTrendingUp size={32} color="#539BFF" />
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {globalStats?.presetUsageRate.toFixed(1) || 0}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Uso de Presets
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* 👇 Top Presets */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardCard title="🏆 Presets Más Utilizados">
            <Box>
              {presetsWithStats.length === 0 ? (
                <Alert severity="info">
                  No hay datos de uso de presets todavía. Crea algunas requisiciones usando presets para ver estadísticas.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  {presetsWithStats.map((item, index) => (
                    <Paper key={item.preset?.id || index} sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                              label={`#${index + 1}`}
                              color="primary"
                              size="small"
                            />
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.preset?.name || 'Sin nombre'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {item.preset?.type}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Usos
                          </Typography>
                          <Typography variant="h6">
                            {item.stats.totalUsage}
                          </Typography>
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Modificado
                          </Typography>
                          <Typography variant="body2">
                            {item.stats.modificationRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={item.stats.modificationRate}
                            color={item.stats.modificationRate > 50 ? 'warning' : 'success'}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>

                        <Grid size={{ xs: 6, sm: 2 }}>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Aprobado
                          </Typography>
                          <Typography variant="body2">
                            {item.stats.approvalRate.toFixed(1)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={item.stats.approvalRate}
                            color={item.stats.approvalRate > 70 ? 'success' : 'error'}
                            sx={{ mt: 0.5 }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>
          </DashboardCard>
        </Grid>

        {/* 👇 Insights */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={3}>
            {/* Insight 1: Preset más eficiente */}
            {presetsWithStats.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    💡 Preset Más Eficiente
                  </Typography>
                  {(() => {
                    const mostEfficient = presetsWithStats.reduce((prev, current) => 
                      (current.stats.approvalRate > prev.stats.approvalRate) ? current : prev
                    );
                    return (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {mostEfficient.preset?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {mostEfficient.stats.approvalRate.toFixed(1)}% de aprobación
                        </Typography>
                        <Alert severity="success" sx={{ mt: 1 }}>
                          Este preset tiene la mayor tasa de aprobación
                        </Alert>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Insight 2: Preset más modificado */}
            {presetsWithStats.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ⚠️ Preset Más Modificado
                  </Typography>
                  {(() => {
                    const mostModified = presetsWithStats.reduce((prev, current) => 
                      (current.stats.modificationRate > prev.stats.modificationRate) ? current : prev
                    );
                    return (
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {mostModified.preset?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {mostModified.stats.modificationRate.toFixed(1)}% modificado
                        </Typography>
                        <Alert severity="warning" sx={{ mt: 1 }}>
                          Considera revisar este preset para mejorar su configuración
                        </Alert>
                      </Box>
                    );
                  })()}
                </CardContent>
              </Card>
            )}
          </Stack>
        </Grid>

        {/* 👇 Items Más Solicitados */}
        <Grid size={12}>
          <DashboardCard title="📦 Items Más Solicitados desde Presets">
            {loadingItems ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : itemsError ? (
              <Alert severity="error">{itemsError}</Alert>
            ) : topItems.length === 0 ? (
              <Alert severity="info">
                No hay datos de items solicitados desde presets todavía
              </Alert>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={60}>Pos.</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Categoría</TableCell>
                    <TableCell align="center">Veces Solicitado</TableCell>
                    <TableCell align="center">Cantidad Total</TableCell>
                    <TableCell align="center">Stock Actual</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topItems.map((topItem, index) => (
                    <TableRow key={topItem.item?.id || index}>
                      <TableCell>
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color={index < 3 ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {topItem.item?.descripcion || 'Item eliminado'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={topItem.item?.categoria || '—'}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6">
                          {topItem.requestCount}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="h6">
                          {topItem.totalQuantity}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={topItem.item?.inventario || 0}
                          size="small"
                          color={
                            (topItem.item?.inventario || 0) > topItem.totalQuantity / topItem.requestCount
                              ? 'success'
                              : 'error'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DashboardCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
}