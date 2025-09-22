// app/(DashboardLayout)/layout.tsx  (Server Component)
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ClientDashboardShell from "./ClientDashboardShell";
import { authOptions } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/authentication/login");

  const email = session.user?.email ?? "";
  return <ClientDashboardShell userEmail={email}>{children}</ClientDashboardShell>;
}
