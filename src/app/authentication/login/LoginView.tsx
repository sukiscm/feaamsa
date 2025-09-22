"use client";
import Link from "next/link";
import { Grid, Box, Card, Stack, Typography } from "@mui/material";
import PageContainer from "@/app/(DashboardLayout)/components/container/PageContainer";
import Logo from "@/app/(DashboardLayout)/layout/shared/logo/Logo";
import AuthLogin from "../auth/AuthLogin"; // <-- tu componente actual
export default function LoginView() {
  return <PageContainer title="Login" description="this is Login page">
      <Box sx={{ position: "relative", "&:before": { content: '""', background: "radial-gradient(#d2f1df, #d3d7fa, #bad8f4)", backgroundSize: "400% 400%", animation: "gradient 15s ease infinite", position: "absolute", height: "100%", width: "100%", opacity: "0.3" } }}>
        <Grid container spacing={0} justifyContent="center" sx={{ height: "100vh" }}>
          <Grid display="flex" justifyContent="center" alignItems="center" size={{ xs:12, sm:12, lg:4, xl:3 }}>
            <Card elevation={9} sx={{ p: 4, zIndex: 1, width: "100%", maxWidth: 500 }}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Logo />
              </Box>

              {/* Tu form visual, pero internamente debe llamar signIn */}
              <AuthLogin
                subtext={
                  <Typography variant="subtitle1" textAlign="center" mb={1}>
                    <Box sx={{ fontWeight: 'bold' }}>SERVICIOS DE INGENIERÍA</Box>
                    <Box>SOLUCIONES INTEGRALES Y SOCIALES</Box>
                  </Typography>
                }
                subtitle={
                  <Stack direction="row" spacing={1} justifyContent="center" mt={3}>
                    <Typography color="textSecondary" variant="h6" fontWeight="500">¿Estas perdido?</Typography>
                    <Typography component={Link} href="https://www.aamsatech.com" fontWeight="500" sx={{ textDecoration: "none", color: "primary.main" }}>
                      Visita Nuestra Pagina Principal
                    </Typography>
                  </Stack>
                }
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </PageContainer> // aquí va tu componente visual con el form
}