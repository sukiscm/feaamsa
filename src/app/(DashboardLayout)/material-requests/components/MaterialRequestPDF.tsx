// src/app/(DashboardLayout)/material-requests/components/MaterialRequestPDF.tsx
'use client';

import React from 'react';
import { 
  Document, 
  Page, 
  Text, 
  View, 
  StyleSheet, 
  Image,
  Font 
} from '@react-pdf/renderer';
import { MaterialRequest } from '@/app/hooks/useMaterialRequests';

// Registrar fuentes (opcional, usar fuentes del sistema)
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf', fontWeight: 300 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', fontWeight: 400 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf', fontWeight: 500 },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 9,
    fontFamily: 'Roboto',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    borderBottom: '2pt solid #003897',
    paddingBottom: 10,
  },
  logo: {
    width: 120,
    height: 40,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 700,
    color: '#003897',
  },
  subtitle: {
    fontSize: 8,
    color: '#666',
    marginTop: 2,
  },
  infoBox: {
    border: '1pt solid #333',
    padding: 8,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontWeight: 700,
    width: 120,
  },
  value: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    backgroundColor: '#003897',
    color: 'white',
    padding: 6,
    marginTop: 10,
    marginBottom: 8,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#333',
    color: 'white',
    padding: 6,
    fontWeight: 700,
    fontSize: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #ccc',
    padding: 6,
    fontSize: 8,
  },
  tableRowAlt: {
    backgroundColor: '#f5f5f5',
  },
  col1: { width: '50%', paddingRight: 4 },
  col2: { width: '15%', textAlign: 'center' },
  col3: { width: '15%', textAlign: 'center' },
  col4: { width: '10%', textAlign: 'center' },
  col5: { width: '10%', textAlign: 'center' },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: '1pt solid #333',
    paddingTop: 10,
    fontSize: 7,
    color: '#666',
  },
  signatureSection: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  signatureBox: {
    width: 150,
    textAlign: 'center',
  },
  signatureLine: {
    borderTop: '1pt solid #333',
    marginTop: 40,
    paddingTop: 4,
  },
  statusBadge: {
    padding: 4,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 700,
    textAlign: 'center',
    marginLeft: 10,
  },
  statusPending: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
  },
  statusApproved: {
    backgroundColor: '#D4EDDA',
    color: '#155724',
  },
  statusRejected: {
    backgroundColor: '#F8D7DA',
    color: '#721C24',
  },
  notesBox: {
    backgroundColor: '#f9f9f9',
    border: '1pt solid #ddd',
    padding: 8,
    marginTop: 10,
    fontSize: 8,
  },
  watermark: {
    position: 'absolute',
    top: '40%',
    left: '25%',
    fontSize: 60,
    color: '#f0f0f0',
    opacity: 0.3,
    transform: 'rotate(-45deg)',
    fontWeight: 700,
  },
});

interface MaterialRequestPDFProps {
  request: MaterialRequest;
}

const MaterialRequestPDF: React.FC<MaterialRequestPDFProps> = ({ request }) => {
  const getStatusBadgeStyle = () => {
    switch (request.status) {
      case 'PENDING':
        return styles.statusPending;
      case 'APPROVED':
        return styles.statusApproved;
      case 'REJECTED':
        return styles.statusRejected;
      default:
        return styles.statusPending;
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

const cleanTextForPDF = (text: string): string => {
  if (!text) return '';
  
  return text
    .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g, '') // Emojis (pares surrogados)
    .replace(/[\u2600-\u27BF]/g, '') // Símbolos
    .replace(/[\uD83C-\uD83E][\uDC00-\uDFFF]/g, '') // Más emojis
    .trim();
};

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Watermark para estados específicos */}
        {request.status === 'REJECTED' && (
          <Text style={styles.watermark}>RECHAZADA</Text>
        )}
        {request.status === 'CANCELLED' && (
          <Text style={styles.watermark}>CANCELADA</Text>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>AAMSA TECHNOLOGIES</Text>
            <Text style={styles.subtitle}>Servicios de Ingeniería</Text>
            <Text style={styles.subtitle}>Soluciones Integrales y Sociales</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: 700 }}>REQUISICIÓN</Text>
            <Text style={{ fontSize: 10, marginTop: 4 }}>
              FOLIO: {request.folio}
            </Text>
            <View style={[styles.statusBadge, getStatusBadgeStyle()]}>
              <Text>{request.status}</Text>
            </View>
          </View>
        </View>

        {/* Información General */}
        <View style={styles.infoBox}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>SERVICIO:</Text>
            <Text style={styles.value}>Mantenimiento Preventivo</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>TICKET:</Text>
            <Text style={styles.value}>{request.ticket.title}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>FECHA DE SOLICITUD:</Text>
            <Text style={styles.value}>{formatDate(request.createdAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>SOLICITANTE:</Text>
            <Text style={styles.value}>{request.requestedBy.email}</Text>
          </View>
          {request.approvedBy && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>APROBADO POR:</Text>
              <Text style={styles.value}>{request.approvedBy.email}</Text>
            </View>
          )}
          {request.approvedAt && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>FECHA DE APROBACIÓN:</Text>
              <Text style={styles.value}>{formatDate(request.approvedAt)}</Text>
            </View>
          )}
          {request.fromPreset && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>PLANTILLA USADA:</Text>
              <Text style={styles.value}>
                {request.fromPreset.name}
                {request.wasModifiedFromPreset && ' (Modificada)'}
              </Text>
            </View>
          )}
        </View>

        {/* Observaciones Generales */}
        {request.notes && (
          <View style={styles.notesBox}>
            <Text style={{ fontWeight: 700, marginBottom: 4 }}>
              OBSERVACIONES:
            </Text>
            <Text>{cleanTextForPDF(request.notes) || '—'}</Text>
          </View>
        )}

        {/* Tabla de Materiales */}
        <Text style={styles.sectionTitle}>
          MATERIALES Y HERRAMIENTAS SOLICITADOS
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>DESCRIPCIÓN</Text>
            <Text style={styles.col2}>MARCA/TIPO</Text>
            <Text style={styles.col3}>SOLICITADO</Text>
            <Text style={styles.col4}>APROBADO</Text>
            <Text style={styles.col5}>ENTREGADO</Text>
          </View>

{request.items.map((item, index) => (
  <View
    key={item.id}
    style={[
      styles.tableRow,
      ...(index % 2 === 1 ? [styles.tableRowAlt] : []),
    ]}
  >
              <View style={styles.col1}>
                <Text style={{ fontWeight: 500 }}>{item.item.descripcion}</Text>
                {item.notes && (
                  <Text style={{ fontSize: 7, color: '#666', marginTop: 2 }}>
                    Nota: {item.notes}
                  </Text>
                )}
              </View>
              <Text style={styles.col2}>{item.item.categoria || '—'}</Text>
              <Text style={styles.col3}>{item.quantityRequested}</Text>
              <Text style={styles.col4}>
                {item.quantityApproved || '—'}
              </Text>
              <Text style={styles.col5}>
                {item.quantityDelivered || '—'}
              </Text>
            </View>
          ))}
        </View>

        {/* Totales */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-end',
            marginTop: 10,
            paddingTop: 8,
            borderTop: '1pt solid #333',
          }}
        >
          <Text style={{ fontWeight: 700, marginRight: 20 }}>
            TOTAL ITEMS: {request.items.length}
          </Text>
          <Text style={{ fontWeight: 700 }}>
            TOTAL SOLICITADO:{' '}
            {request.items.reduce(
              (sum, item) => sum + parseFloat(item.quantityRequested),
              0
            )}
          </Text>
        </View>

        {/* Motivo de Rechazo */}
        {request.rejectionReason && (
          <View style={[styles.notesBox, { backgroundColor: '#F8D7DA' }]}>
            <Text style={{ fontWeight: 700, marginBottom: 4, color: '#721C24' }}>
              MOTIVO DE RECHAZO:
            </Text>
            <Text style={{ color: '#721C24' }}>{request.rejectionReason}</Text>
          </View>
        )}

        {/* Sección de Firmas */}
        <View style={styles.signatureSection}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine}>
              <Text style={{ fontSize: 7, fontWeight: 700 }}>SOLICITANTE</Text>
              <Text style={{ fontSize: 7, marginTop: 2 }}>
                {request.requestedBy.email}
              </Text>
            </View>
          </View>

          {request.approvedBy && (
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={{ fontSize: 7, fontWeight: 700 }}>
                  ALMACENISTA
                </Text>
                <Text style={{ fontSize: 7, marginTop: 2 }}>
                  {request.approvedBy.email}
                </Text>
              </View>
            </View>
          )}

          {request.deliveredBy && (
            <View style={styles.signatureBox}>
              <View style={styles.signatureLine}>
                <Text style={{ fontSize: 7, fontWeight: 700 }}>ENTREGÓ</Text>
                <Text style={{ fontSize: 7, marginTop: 2 }}>
                  {request.deliveredBy.email}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>Documento generado el {formatDate(new Date().toISOString())}</Text>
            <Text>PRO-SGC-23A</Text>
          </View>
          <Text style={{ marginTop: 4, textAlign: 'center' }}>
            Almacen General Aamsa Technologies
          </Text>
        </View>

        {/* Número de página */}
        <Text
          style={{
            position: 'absolute',
            bottom: 10,
            right: 30,
            fontSize: 8,
          }}
          render={({ pageNumber, totalPages }) =>
            `Página ${pageNumber} de ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default MaterialRequestPDF;