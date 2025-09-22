"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
  Checkbox,
} from "@mui/material";
import Link from "next/link";

import CustomTextField from "@/app/(DashboardLayout)/components/forms/theme-elements/CustomTextField";

interface LoginProps {
  title?: string;
  subtitle?: React.ReactNode;
  subtext?: React.ReactNode;
  callbackUrl?: string; // ruta a la que quieres ir post-login (por defecto /dashboard)
}

const AuthLogin = ({ title, subtitle, subtext, callbackUrl = "/" }: LoginProps) => {
  const [email, setEmail] = useState("");       // ← usamos "email" aunque el label diga Username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [remember, setRemember] = useState(true); // visual por ahora

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    // NextAuth v4 - Credentials
    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,         // deja que NextAuth haga la redirección
      callbackUrl,            // p.ej. "/dashboard"
    });

    // Si redirect:true, no seguimos ejecutando aquí.
    // Si prefieres manejar manualmente, usa redirect:false y checa res?.ok / res?.error.
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit}>
      {title ? (
        <Typography fontWeight="700" variant="h2" mb={1}>
          {title}
        </Typography>
      ) : null}

      {subtext}

      <Stack>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="email"
            mb="5px"
          >
            Username
          </Typography>
          <CustomTextField
            id="email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          />
        </Box>

        <Box mt="25px">
          <Typography
            variant="subtitle1"
            fontWeight={600}
            component="label"
            htmlFor="password"
            mb="5px"
          >
            Password
          </Typography>
          <CustomTextField
            id="password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
          />
        </Box>

        <Stack
          justifyContent="space-between"
          direction="row"
          alignItems="center"
          my={2}
        >
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
              }
              label="Remember this Device"
            />
          </FormGroup>

          <Typography
            component={Link}
            href="/"
            fontWeight="500"
            sx={{ textDecoration: "none", color: "primary.main" }}
          >
            Forgot Password ?
          </Typography>
        </Stack>
      </Stack>

      {err && (
        <Typography color="error" variant="body2" mb={1}>
          {err}
        </Typography>
      )}

      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"              // 👈 submit real (sin Link)
          disabled={loading}
        >
          {loading ? "Entrando..." : "Sign In"}
        </Button>
      </Box>

      {subtitle}
    </form>
  );
};

export default AuthLogin;
