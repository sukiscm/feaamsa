// app/not-found.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export default async function NotFound() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");          // <-- ruta de tu dashboard
  redirect("/authentication/login");            // <-- ruta de tu login
}
