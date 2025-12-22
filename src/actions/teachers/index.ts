"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { teachersTable, usersTable, accountsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createTeacherSchema,
  updateTeacherSchema,
  deleteTeacherSchema,
  getTeacherSchema,
} from "./schema";

export const createTeacher = actionClient
  .schema(createTeacherSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const userId = nanoid();
    const teacherId = nanoid();
    const accountId = nanoid();

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("E-mail já cadastrado");
    }

    const existingCpf = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.cpf, parsedInput.cpf))
      .limit(1);

    if (existingCpf.length > 0) {
      throw new Error("CPF já cadastrado");
    }

    await db.transaction(async (tx) => {
      await tx.insert(usersTable).values({
        id: userId,
        name: parsedInput.name,
        email: parsedInput.email,
        emailVerified: false,
        role: "teacher",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(accountsTable).values({
        id: accountId,
        accountId: userId,
        providerId: "credential",
        userId: userId,
        password: parsedInput.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await tx.insert(teachersTable).values({
        id: teacherId,
        userId: userId,
        cpf: parsedInput.cpf,
        phone: parsedInput.phone || null,
        birthDate: parsedInput.birthDate || null,
        address: parsedInput.address || null,
        city: parsedInput.city || null,
        state: parsedInput.state || null,
        zipCode: parsedInput.zipCode || null,
        specialization: parsedInput.specialization || null,
        hireDate: parsedInput.hireDate,
        salary: parsedInput.salary
          ? parsedInput.salary.replace(/[^\d,.-]/g, "").replace(",", ".")
          : null,
        status: parsedInput.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    revalidatePath("/professores");
    return { success: true, id: teacherId };
  });

export const updateTeacher = actionClient
  .schema(updateTeacherSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacherResult = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.id, parsedInput.id))
      .limit(1);

    if (teacherResult.length === 0) {
      throw new Error("Professor não encontrado");
    }

    const teacher = teacherResult[0];

    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, teacher.userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = userResult[0];

    if (parsedInput.email && parsedInput.email !== user.email) {
      const existingUser = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, parsedInput.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error("E-mail já cadastrado");
      }
    }

    if (parsedInput.cpf && parsedInput.cpf !== teacher.cpf) {
      const existingCpf = await db
        .select()
        .from(teachersTable)
        .where(eq(teachersTable.cpf, parsedInput.cpf))
        .limit(1);

      if (existingCpf.length > 0) {
        throw new Error("CPF já cadastrado");
      }
    }

    await db.transaction(async (tx) => {
      if (parsedInput.name || parsedInput.email) {
        await tx
          .update(usersTable)
          .set({
            ...(parsedInput.name && { name: parsedInput.name }),
            ...(parsedInput.email && { email: parsedInput.email }),
            updatedAt: new Date(),
          })
          .where(eq(usersTable.id, teacher.userId));
      }

      if (parsedInput.password && parsedInput.password.trim() !== "") {
        await tx
          .update(accountsTable)
          .set({
            password: parsedInput.password,
            updatedAt: new Date(),
          })
          .where(eq(accountsTable.userId, teacher.userId));
      }

      await tx
        .update(teachersTable)
        .set({
          ...(parsedInput.cpf && { cpf: parsedInput.cpf }),
          ...(parsedInput.phone !== undefined && { phone: parsedInput.phone }),
          ...(parsedInput.birthDate && { birthDate: parsedInput.birthDate }),
          ...(parsedInput.address !== undefined && {
            address: parsedInput.address,
          }),
          ...(parsedInput.city !== undefined && { city: parsedInput.city }),
          ...(parsedInput.state !== undefined && { state: parsedInput.state }),
          ...(parsedInput.zipCode !== undefined && {
            zipCode: parsedInput.zipCode,
          }),
          ...(parsedInput.specialization !== undefined && {
            specialization: parsedInput.specialization,
          }),
          ...(parsedInput.hireDate && { hireDate: parsedInput.hireDate }),
          ...(parsedInput.salary !== undefined && {
            salary: parsedInput.salary
              ? parsedInput.salary.replace(/[^\d,.-]/g, "").replace(",", ".")
              : null,
          }),
          ...(parsedInput.status && { status: parsedInput.status }),
          updatedAt: new Date(),
        })
        .where(eq(teachersTable.id, parsedInput.id));
    });

    revalidatePath("/professores");
    return { success: true };
  });

export const deleteTeacher = actionClient
  .schema(deleteTeacherSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacherResult = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.id, parsedInput.id))
      .limit(1);

    if (teacherResult.length === 0) {
      throw new Error("Professor não encontrado");
    }

    await db.delete(teachersTable).where(eq(teachersTable.id, parsedInput.id));

    revalidatePath("/professores");
    return { success: true };
  });

export const getTeacher = actionClient
  .schema(getTeacherSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacherResult = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.id, parsedInput.id))
      .limit(1);

    if (teacherResult.length === 0) {
      throw new Error("Professor não encontrado");
    }

    const teacher = teacherResult[0];

    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, teacher.userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = userResult[0];

    return {
      teacher: {
        ...teacher,
        user,
      },
    };
  });

export async function getTeachers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const teachers = await db
    .select({
      teacher: teachersTable,
      user: usersTable,
    })
    .from(teachersTable)
    .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .orderBy(desc(teachersTable.createdAt));

  return teachers.map((item) => ({
    ...item.teacher,
    user: item.user,
  }));
}
