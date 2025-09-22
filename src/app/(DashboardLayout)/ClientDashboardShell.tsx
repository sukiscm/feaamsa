// app/(DashboardLayout)/ClientDashboardShell.tsx
"use client";
import React, { useState } from "react";
import { styled, Container, Box } from "@mui/material";
import Header from "@/app/(DashboardLayout)/layout/header/Header";
import Sidebar from "@/app/(DashboardLayout)/layout/sidebar/Sidebar";

const MainWrapper = styled("div")(() => ({ display: "flex", minHeight: "100vh", width: "100%" }));
const PageWrapper = styled("div")(() => ({ display: "flex", flexGrow: 1, paddingBottom: "60px", flexDirection: "column", zIndex: 1, backgroundColor: "transparent" }));

export default function ClientDashboardShell({
  children,
  userEmail,
}: {
  children: React.ReactNode;
  userEmail: string;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <MainWrapper>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        isMobileSidebarOpen={isMobileSidebarOpen}
        onSidebarClose={() => setMobileSidebarOpen(false)}
      />
      <PageWrapper>
        <Header toggleMobileSidebar={() => setMobileSidebarOpen(true)} userEmail={userEmail} />
        <Container sx={{ paddingTop: "20px", maxWidth: "1200px" }}>
          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>{children}</Box>
        </Container>
      </PageWrapper>
    </MainWrapper>
  );
}
