import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (user.length > 0) {
      if (user[0].role === "student") {
        redirect("/portal-aluno");
      } else if (user[0].role === "teacher") {
        redirect("/portal-professor");
      } else {
        redirect("/dashboard");
      }
    } else {
      redirect("/dashboard");
    }
  }

  redirect("/authentication");
}
