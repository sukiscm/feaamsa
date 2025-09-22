// app/authentication/login/page.tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginView from "./LoginView"; // tu UI cliente
import { authOptions } from "@/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/dashboard"); // ajusta tu ruta
  }
  return <LoginView />; // renderiza UI cliente
}