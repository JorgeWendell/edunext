"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  usersTable,
  studentsTable,
  teachersTable,
  accountsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { actionClient } from "../create-safe-action-client";
import {
  createUserSchema,
  updateUserRoleSchema,
  deleteUserSchema,
} from "./schema";

export async function getUsers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const currentUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, session.user.id))
    .limit(1);

  if (currentUser.length === 0) {
    throw new Error("Usuário não encontrado no banco de dados");
  }

  if (currentUser[0].role !== "admin") {
    throw new Error(
      `Acesso negado. Seu role atual é: ${currentUser[0].role}. Apenas administradores podem gerenciar usuários.`,
    );
  }

  const users = await db.select().from(usersTable).orderBy(usersTable.name);

  const usersWithRelations = await Promise.all(
    users.map(async (user) => {
      const student = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.userId, user.id))
        .limit(1);

      const teacher = await db
        .select()
        .from(teachersTable)
        .where(eq(teachersTable.userId, user.id))
        .limit(1);

      return {
        ...user,
        hasStudentProfile: student.length > 0,
        hasTeacherProfile: teacher.length > 0,
      };
    }),
  );

  return usersWithRelations;
}

export const createUser = actionClient
  .schema(createUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    if (currentUser[0].role !== "admin") {
      throw new Error(
        `Acesso negado. Seu role atual é: ${currentUser[0].role}. Apenas administradores podem criar usuários.`,
      );
    }

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email já cadastrado");
    }

    try {
      const result = await auth.api.signUpEmail({
        body: {
          email: parsedInput.email,
          password: parsedInput.password,
          name: parsedInput.name,
        },
        headers: await headers(),
      });

      if (!result?.user?.id) {
        throw new Error("Erro ao criar usuário. Tente novamente.");
      }

      const createdUserId = result.user.id;

      await db
        .update(usersTable)
        .set({
          role: parsedInput.role,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, createdUserId));

      revalidatePath("/usuarios");
      return { success: true, id: createdUserId };
    } catch (error: any) {
      const errorMessage =
        error?.message || error?.toString() || "Erro ao criar usuário";
      if (
        errorMessage.includes("already exists") ||
        errorMessage.includes("já cadastrado") ||
        errorMessage.includes("USER_ALREADY_EXISTS")
      ) {
        throw new Error("Email já cadastrado");
      }
      throw new Error(errorMessage);
    }
  });

export const updateUserRole = actionClient
  .schema(updateUserRoleSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    if (currentUser[0].role !== "admin") {
      throw new Error(
        `Acesso negado. Seu role atual é: ${currentUser[0].role}. Apenas administradores podem criar usuários.`,
      );
    }

    if (parsedInput.id === session.user.id) {
      throw new Error("Você não pode alterar seu próprio role");
    }

    await db
      .update(usersTable)
      .set({
        role: parsedInput.role,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, parsedInput.id));

    revalidatePath("/usuarios");
    return { success: true };
  });

export const deleteUser = actionClient
  .schema(deleteUserSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const currentUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (currentUser.length === 0) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    if (currentUser[0].role !== "admin") {
      throw new Error(
        `Acesso negado. Seu role atual é: ${currentUser[0].role}. Apenas administradores podem criar usuários.`,
      );
    }

    if (parsedInput.id === session.user.id) {
      throw new Error("Você não pode excluir sua própria conta");
    }

    await db.delete(usersTable).where(eq(usersTable.id, parsedInput.id));

    revalidatePath("/usuarios");
    return { success: true };
  });
