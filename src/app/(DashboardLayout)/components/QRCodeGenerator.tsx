// src/app/(DashboardLayout)/components/QRCodeGenerator.tsx
'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import { IconDownload, IconPrinter, IconRefresh } from '@tabler/icons-react';

interface QRCodeGeneratorProps {
  value: string; // Código QR
  itemName?: string;
  itemCode?: string;
  size?: number;
  showActions?: boolean;
  onRegenerate?: () => void;
}

export default function QRCodeGenerator({
  value,
  itemName,
  itemCode,
  size = 200,
  showActions = true,
  onRegenerate,
}: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  // Descargar QR como imagen
  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = size;
    canvas.height = size;

    img.onload = () => {
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${itemCode || value}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  // Imprimir QR
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgString = new XMLSerializer().serializeToString(svg);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR - ${itemName || value}</title>
          <style>
            @page { size: auto; margin: 20mm; }
            body { 
              font-family: Arial, sans-serif; 
              text-align: center; 
              padding: 20px;
            }
            .qr-container {
              display: inline-block;
              border: 2px solid #000;
              padding: 20px;
              border-radius: 8px;
            }
            .item-name {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
              margin-bottom: 5px;
            }
            .item-code {
              font-size: 14px;
              color: #666;
              margin-bottom: 15px;
            }
            .qr-code-text {
              font-size: 12px;
              color: #999;
              margin-top: 10px;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${itemName ? `<div class="item-name">${itemName}</div>` : ''}
            ${itemCode ? `<div class="item-code">Código: ${itemCode}</div>` : ''}
            ${svgString}
            <div class="qr-code-text">${value}</div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      {/* Info del Item */}
      {itemName && (
        <Box textAlign="center">
          <Typography variant="h6" fontWeight="bold">
            {itemName}
          </Typography>
          {itemCode && (
            <Typography variant="body2" color="text.secondary">
              Código: {itemCode}
            </Typography>
          )}
        </Box>
      )}

      {/* QR Code */}
      <Box
        ref={qrRef}
        sx={{
          p: 2,
          bgcolor: 'white',
          borderRadius: 1,
          border: '2px solid',
          borderColor: 'divider',
        }}
      >
        <QRCodeSVG
          value={value}
          size={size}
          level="H"
          includeMargin={false}
        />
      </Box>

      {/* Código QR en texto */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontFamily: 'monospace', fontSize: 11 }}
      >
        {value}
      </Typography>

      {/* Acciones */}
      {showActions && (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Descargar PNG">
            <IconButton size="small" onClick={handleDownload} color="primary">
              <IconDownload size={20} />
            </IconButton>
          </Tooltip>

          <Tooltip title="Imprimir Etiqueta">
            <IconButton size="small" onClick={handlePrint} color="primary">
              <IconPrinter size={20} />
            </IconButton>
          </Tooltip>

          {onRegenerate && (
            <Tooltip title="Regenerar Código">
              <IconButton size="small" onClick={onRegenerate} color="warning">
                <IconRefresh size={20} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      )}
    </Paper>
  );
}