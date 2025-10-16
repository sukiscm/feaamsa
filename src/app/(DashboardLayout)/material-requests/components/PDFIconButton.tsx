// src/app/(DashboardLayout)/material-requests/components/PDFIconButton.tsx
'use client';

import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { IconFileTypePdf, IconDownload, IconEye } from '@tabler/icons-react';
import { pdf } from '@react-pdf/renderer';
import { MaterialRequest } from '@/app/hooks/useMaterialRequests';
import MaterialRequestPDF from './MaterialRequestPDF';

interface PDFIconButtonProps {
  request: MaterialRequest;
}

export default function PDFIconButton({ request }: PDFIconButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleViewPDF = async () => {
    handleClose();
    setGenerating(true);
    
    try {
      const blob = await pdf(<MaterialRequestPDF request={request} />).toBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    handleClose();
    setGenerating(true);
    
    try {
      const blob = await pdf(<MaterialRequestPDF request={request} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Requisicion_${request.folio}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <Tooltip title="Generar PDF">
        <IconButton 
          size="small" 
          onClick={handleClick}
          disabled={generating}
          color="error"
        >
          {generating ? (
            <CircularProgress size={18} />
          ) : (
            <IconFileTypePdf size={18} />
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleViewPDF}>
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText>Ver PDF</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDownloadPDF}>
          <ListItemIcon>
            <IconDownload size={18} />
          </ListItemIcon>
          <ListItemText>Descargar PDF</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}