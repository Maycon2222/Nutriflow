import { redirect } from "next/navigation";
import { getCurrentUser } from "@/utils/auth";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (user?.userId) {
    redirect("/dashboard");
  }

  redirect("/login");
}
