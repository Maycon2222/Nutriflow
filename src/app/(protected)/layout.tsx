import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/utils/auth";

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getCurrentUser();
  if (!session?.userId) {
    redirect("/login");
  }

  return <AppShell>{children}</AppShell>;
}
