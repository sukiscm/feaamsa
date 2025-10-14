'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Alert,
  CircularProgress,
  Paper,
  Stack,
} from '@mui/material';
import { IconArrowLeft, IconTemplate } from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';

import { type MaterialRequest } from '@/app/hooks/useMaterialRequests';
import ApproveModal from '../components/ApproveModal';
import RejectModal from '../components/RejectModal';

export default function MaterialRequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = params.id as string;
  const action = searchParams.get('action');

  const [request, setRequest] = useState<MaterialRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  useEffect(() => {
    if (action === 'approve') setApproveModalOpen(true);
    if (action === 'reject') setRejectModalOpen(true);
  }, [action]);

  const loadRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/material-requests/${requestId}`);
      if (!response.ok) throw new Error('Error al cargar la solicitud');
      const data = await response.json();
      setRequest(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    loadRequest();
    router.push('/material-requests');
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

  if (error || !request) {
    return (
      <PageContainer title="Error" description="">
        <Alert severity="error">{error || 'Solicitud no encontrada'}</Alert>
      </PageContainer>
    );
  }

  const statusColor = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    DELIVERED: 'info',
    CANCELLED: 'default',
    PARTIAL: 'primary', // Added PARTIAL status
  }[request.status] as any;

  const isPending = request.status === 'PENDING';

  return (
    <PageContainer title={`Material Request - ${request.folio}`} description="Detalle de solicitud">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/material-requests')}
          variant="outlined"
          size="small"
        >
          Volver
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Info principal */}
        <Grid size={{ xs: 12, md: 8 }}>
          <DashboardCard title={`📋 ${request.folio}`}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box mt={0.5}>
                  <Chip label={request.status} color={statusColor} />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Ticket
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {request.ticket.title}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Solicitado por
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {request.requestedBy?.email || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Aprobado por
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {request.approvedBy?.email || '—'}
                </Typography>
              </Grid>

              {request.notes && (
                <Grid size={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="caption" color="text.secondary">
                    Observaciones
                  </Typography>
                  <Typography variant="body2" mt={0.5}>
                    {request.notes}
                  </Typography>
                </Grid>
              )}

              {request.rejectionReason && (
                <Grid size={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    <strong>Motivo de rechazo:</strong> {request.rejectionReason}
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DashboardCard>

          {/* Items solicitados */}
          <Box mt={3}>
            <DashboardCard title="📦 Items Solicitados">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {request.items.map((item) => (
                  <Paper key={item.id} sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {item.item.descripcion}
                        </Typography>
                        {item.item.categoria && (
                          <Chip 
                            label={item.item.categoria} 
                            size="small" 
                            sx={{ mt: 0.5 }}
                          />
                        )}
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Solicitado
                        </Typography>
                        <Typography variant="h6">
                          {item.quantityRequested}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Aprobado
                        </Typography>
                        <Typography variant="h6">
                          {item.quantityApproved || '—'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          Entregado
                        </Typography>
                        <Typography variant="h6">
                          {item.quantityDelivered || '—'}
                        </Typography>
                      </Grid>
                      {item.notes && (
                        <Grid size={12}>
                          <Typography variant="caption" color="text.secondary">
                            Notas: {item.notes}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                ))}
              </Box>
            </DashboardCard>
          </Box>
        </Grid>

        {/* Panel lateral */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📅 Fechas
              </Typography>
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary">
                  Creado
                </Typography>
                <Typography variant="body2">
                  {new Date(request.createdAt).toLocaleString('es-MX')}
                </Typography>
              </Box>
              {request.approvedAt && (
                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary">
                    Aprobado
                  </Typography>
                  <Typography variant="body2">
                    {new Date(request.approvedAt).toLocaleString('es-MX')}
                  </Typography>
                </Box>
              )}
              {request.deliveredAt && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Entregado
                  </Typography>
                  <Typography variant="body2">
                    {new Date(request.deliveredAt).toLocaleString('es-MX')}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

{request.fromPreset && (
  <Grid size={12}>
    <Card sx={{ bgcolor: 'primary.lighter' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <IconTemplate size={24} />
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              Creado desde preset: {request.fromPreset.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {request.fromPreset.description}
            </Typography>
            {request.wasModifiedFromPreset && (
              <Chip
                label="Modificado por el usuario"
                size="small"
                color="warning"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
)}

          {isPending && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  ⚙️ Acciones
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => setApproveModalOpen(true)}
                  >
                    ✓ Aprobar Solicitud
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    onClick={() => setRejectModalOpen(true)}
                  >
                    ✗ Rechazar Solicitud
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
          
        </Grid>
      </Grid>

      {/* Modales */}
      <ApproveModal
        open={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        request={request}
        onSuccess={handleSuccess}
      />

      <RejectModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        request={request}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
}