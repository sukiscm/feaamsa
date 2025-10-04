// app/(DashboardLayout)/tickets/CreateTicketDialog.tsx
"use client";
import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Stack, Alert
} from "@mui/material";
import { useCreateTicket } from "@/app/hooks/useCreateTicket";

const priorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export default function CreateTicketDialog({
  open, onClose, onCreated
}: { open: boolean; onClose: () => void; onCreated: () => void; }) {
  const { createTicket, loading, error, setError } = useCreateTicket();

  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [priority, setPriority] = React.useState<(typeof priorities)[number]>("MEDIUM");
  const [location, setLocation] = React.useState("");

  React.useEffect(() => {
    if (!open) {
      // limpiar estado cuando se cierre
      setError(null);
      setTitle(""); setDescription(""); setPriority("MEDIUM"); setLocation("");
    }
  }, [open, setError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTicket({ title, description, priority, location });
      onClose();
      onCreated(); // refrescar tabla
    } catch {
      // error ya quedó en el hook -> se muestra en el Alert
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit}>
      <DialogTitle>Nuevo Ticket</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Título"
            required
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <TextField
            label="Descripción"
            multiline
            minRows={3}
            fullWidth
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <TextField
            select
            label="Prioridad"
            fullWidth
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            {priorities.map((p) => (
              <MenuItem key={p} value={p}>{p}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Ubicación"
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? "Guardando..." : "Crear"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
