import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (!userId || userId !== session.user.id) {
      return NextResponse.json(
        { error: "Você só pode atualizar seu próprio usuário" },
        { status: 403 },
      );
    }

    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      );
    }

    await db
      .update(usersTable)
      .set({
        role: "admin",
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro ao atualizar role:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao atualizar role" },
      { status: 500 },
    );
  }
}
