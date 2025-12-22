import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { teachersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function PortalProfessorLayout({
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

  const teacher = await db
    .select()
    .from(teachersTable)
    .where(eq(teachersTable.userId, session.user.id))
    .limit(1);

  if (teacher.length === 0) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
