'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import PageContainer from '@/app/(DashboardLayout)/components/container/PageContainer';
import DashboardCard from '@/app/(DashboardLayout)/components/shared/DashboardCard';
import { useMaterialRequests, type MaterialRequest } from '@/app/hooks/useMaterialRequests';
import CreateMaterialRequestModal from '../components/CreateMaterialRequestModal';

interface Ticket {
  id: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'CANCELED';
  location?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
  requestedBy?: { email?: string; name?: string };
  assignedTo?: { email?: string; name?: string };
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Material requests del ticket
  const { 
    data: materialRequests, 
    loading: loadingRequests, 
    refetch: refetchRequests 
  } = useMaterialRequests({ ticketId });

  // Cargar ticket
  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets/${ticketId}`)
      .then((r) => {
        if (!r.ok) throw new Error('Error al cargar el ticket');
        return r.json();
      })
      .then((data) => setTicket(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ticketId]);

  const handleSuccess = () => {
    refetchRequests();
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

  if (error || !ticket) {
    return (
      <PageContainer title="Error" description="">
        <Alert severity="error">{error || 'Ticket no encontrado'}</Alert>
      </PageContainer>
    );
  }

  const statusColor = {
    OPEN: 'info',
    IN_PROGRESS: 'warning',
    DONE: 'success',
    CANCELED: 'default',
  }[ticket.status] as any;

  const priorityColor = {
    LOW: 'default',
    MEDIUM: 'info',
    HIGH: 'warning',
    URGENT: 'error',
  }[ticket.priority] as any;

  const canCreateRequest = ticket.status !== 'DONE' && ticket.status !== 'CANCELED';

  return (
    <PageContainer title={`Ticket - ${ticket.title}`} description="Detalle del ticket">
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<IconArrowLeft size={18} />}
          onClick={() => router.push('/tickets')}
          variant="outlined"
          size="small"
        >
          Volver a Tickets
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Información del Ticket */}
        <Grid size={{ xs: 12, md: 8 }}>
          <DashboardCard title={ticket.title}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Estado
                </Typography>
                <Box mt={0.5}>
                  <Chip label={ticket.status} color={statusColor} size="small" />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Prioridad
                </Typography>
                <Box mt={0.5}>
                  <Chip label={ticket.priority} color={priorityColor} size="small" />
                </Box>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Ubicación
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {ticket.location || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Fecha programada
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {ticket.scheduledAt
                    ? new Date(ticket.scheduledAt).toLocaleString('es-MX')
                    : '—'}
                </Typography>
              </Grid>

              <Grid size={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Descripción
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {ticket.description || 'Sin descripción'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Solicitado por
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {ticket.requestedBy?.email || '—'}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Asignado a
                </Typography>
                <Typography variant="body2" mt={0.5}>
                  {ticket.assignedTo?.email || 'No asignado'}
                </Typography>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>

        {/* Info adicional */}
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
                  {new Date(ticket.createdAt).toLocaleString('es-MX')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Última actualización
                </Typography>
                <Typography variant="body2">
                  {new Date(ticket.updatedAt).toLocaleString('es-MX')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Material Requests */}
        <Grid size={12}>
          <DashboardCard 
            title="📦 Solicitudes de Materiales"
            action={
              canCreateRequest && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => setModalOpen(true)}
                >
                  Solicitar Materiales
                </Button>
              )
            }
          >
            {loadingRequests ? (
              <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
              </Box>
            ) : materialRequests.length === 0 ? (
              <Alert severity="info">
                No hay solicitudes de materiales para este ticket.
                {canCreateRequest && ' Puedes crear una nueva solicitud.'}
              </Alert>
            ) : (
              <Box>
                {materialRequests.map((mr) => (
                  <MaterialRequestCard key={mr.id} request={mr} />
                ))}
              </Box>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Modal */}
      <CreateMaterialRequestModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        ticketId={ticket.id}
        ticketTitle={ticket.title}
        onSuccess={handleSuccess}
      />
    </PageContainer>
  );
}

// Componente para mostrar cada Material Request
function MaterialRequestCard({ request }: { request: MaterialRequest }) {
  const statusColor = {
    PENDING: 'warning',
    APPROVED: 'success',
    REJECTED: 'error',
    DELIVERED: 'info',
    CANCELLED: 'default',
    PARTIAL: 'info',
  }[request.status] as any;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">{request.folio}</Typography>
          <Typography variant="caption" color="text.secondary">
            Creado el {new Date(request.createdAt).toLocaleString('es-MX')}
          </Typography>
        </Box>
        <Chip label={request.status} color={statusColor} />
      </Box>

      {request.notes && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          📝 {request.notes}
        </Typography>
      )}

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Item</TableCell>
            <TableCell align="right">Solicitado</TableCell>
            <TableCell align="right">Aprobado</TableCell>
            <TableCell align="right">Entregado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {request.items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.item.descripcion}</TableCell>
              <TableCell align="right">{item.quantityRequested}</TableCell>
              <TableCell align="right">{item.quantityApproved || '—'}</TableCell>
              <TableCell align="right">{item.quantityDelivered || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {request.rejectionReason && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <strong>Motivo de rechazo:</strong> {request.rejectionReason}
        </Alert>
      )}
    </Paper>
  );
}