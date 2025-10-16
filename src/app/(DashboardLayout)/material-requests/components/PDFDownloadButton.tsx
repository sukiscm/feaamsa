// src/app/(DashboardLayout)/material-requests/components/PDFDownloadButton.tsx
'use client';

import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { IconFileTypePdf, IconDownload } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import { MaterialRequest } from '@/app/hooks/useMaterialRequests';
import MaterialRequestPDF from './MaterialRequestPDF';

interface PDFDownloadButtonProps {
  request: MaterialRequest;
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
}

export default function PDFDownloadButton({ 
  request, 
  variant = 'contained',
  size = 'medium',
  fullWidth = false 
}: PDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownloadPDF = async () => {
    setGenerating(true);
    
    try {
      // Generar el PDF
      const blob = await pdf(<MaterialRequestPDF request={request} />).toBlob();
      
      // Crear URL temporal
      const url = URL.createObjectURL(blob);
      
      // Crear link temporal y hacer click
      const link = document.createElement('a');
      link.href = url;
      link.download = `Requisicion_${request.folio}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewPDF = async () => {
    setGenerating(true);
    
    try {
      // Generar el PDF
      const blob = await pdf(<MaterialRequestPDF request={request} />).toBlob();
      
      // Crear URL temporal
      const url = URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña
      window.open(url, '_blank');
      
      // Limpiar después de un delay
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        startIcon={generating ? <CircularProgress size={16} /> : <IconFileTypePdf size={18} />}
        onClick={handleViewPDF}
        disabled={generating}
        sx={{ mr: 1 }}
      >
        {generating ? 'Generando...' : 'Ver PDF'}
      </Button>
      
      <Button
        variant="outlined"
        size={size}
        startIcon={generating ? <CircularProgress size={16} /> : <IconDownload size={18} />}
        onClick={handleDownloadPDF}
        disabled={generating}
      >
        {generating ? 'Generando...' : 'Descargar'}
      </Button>
    </>
  );
}