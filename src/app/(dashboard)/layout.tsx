import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  // Passar o role do usuário para o Sidebar e Topbar
  const userWithRole = {
    ...session.user,
    role: user.length > 0 ? user[0].role : undefined,
  };

  // Se for aluno ou professor, renderizar apenas o conteúdo (sem sidebar/topbar do dashboard)
  // Os layouts dos portais já cuidam do layout próprio
  if (
    user.length > 0 &&
    (user[0].role === "student" || user[0].role === "teacher")
  ) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar user={userWithRole} />
      <div className="lg:pl-72">
        <Topbar user={userWithRole} />
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
