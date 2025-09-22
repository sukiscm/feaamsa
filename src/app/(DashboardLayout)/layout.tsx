import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ClientDashboardShell from "./ClientDashboardShell";
import { authOptions } from "@/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/authentication/login"); // ajusta a tu ruta de login
  return <ClientDashboardShell>{children}</ClientDashboardShell>;
}
