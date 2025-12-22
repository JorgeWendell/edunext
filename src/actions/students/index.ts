"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { studentsTable, usersTable, accountsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createStudentSchema,
  updateStudentSchema,
  deleteStudentSchema,
  getStudentSchema,
} from "./schema";

export const createStudent = actionClient
  .schema(createStudentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const userId = nanoid();
    const studentId = nanoid();
    const accountId = nanoid();

    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, parsedInput.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("E-mail já cadastrado");
    }

    const existingEnrollment = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.enrollmentNumber, parsedInput.enrollmentNumber))
      .limit(1);

    if (existingEnrollment.length > 0) {
      throw new Error("Número de matrícula já cadastrado");
    }

    const existingCpf = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.cpf, parsedInput.cpf))
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
        role: "student",
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

      await tx.insert(studentsTable).values({
        id: studentId,
        userId: userId,
        cpf: parsedInput.cpf,
        phone: parsedInput.phone || null,
        birthDate: parsedInput.birthDate || null,
        address: parsedInput.address || null,
        city: parsedInput.city || null,
        state: parsedInput.state || null,
        zipCode: parsedInput.zipCode || null,
        parentName: parsedInput.parentName || null,
        parentPhone: parsedInput.parentPhone || null,
        parentEmail: parsedInput.parentEmail || null,
        enrollmentNumber: parsedInput.enrollmentNumber,
        status: parsedInput.status,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    revalidatePath("/dashboard/alunos");
    return { success: true, id: studentId };
  });

export const updateStudent = actionClient
  .schema(updateStudentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const studentResult = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.id, parsedInput.id))
      .limit(1);

    if (studentResult.length === 0) {
      throw new Error("Aluno não encontrado");
    }

    const student = studentResult[0];

    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, student.userId))
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

    if (
      parsedInput.enrollmentNumber &&
      parsedInput.enrollmentNumber !== student.enrollmentNumber
    ) {
      const existingEnrollment = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.enrollmentNumber, parsedInput.enrollmentNumber))
        .limit(1);

      if (existingEnrollment.length > 0) {
        throw new Error("Número de matrícula já cadastrado");
      }
    }

    if (parsedInput.cpf && parsedInput.cpf !== student.cpf) {
      const existingCpf = await db
        .select()
        .from(studentsTable)
        .where(eq(studentsTable.cpf, parsedInput.cpf))
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
          .where(eq(usersTable.id, student.userId));
      }

      if (parsedInput.password && parsedInput.password.trim() !== "") {
        await tx
          .update(accountsTable)
          .set({
            password: parsedInput.password,
            updatedAt: new Date(),
          })
          .where(eq(accountsTable.userId, student.userId));
      }

      await tx
        .update(studentsTable)
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
          ...(parsedInput.parentName !== undefined && {
            parentName: parsedInput.parentName,
          }),
          ...(parsedInput.parentPhone !== undefined && {
            parentPhone: parsedInput.parentPhone,
          }),
          ...(parsedInput.parentEmail !== undefined && {
            parentEmail: parsedInput.parentEmail,
          }),
          ...(parsedInput.enrollmentNumber && {
            enrollmentNumber: parsedInput.enrollmentNumber,
          }),
          ...(parsedInput.status && { status: parsedInput.status }),
          updatedAt: new Date(),
        })
        .where(eq(studentsTable.id, parsedInput.id));
    });

    revalidatePath("/dashboard/alunos");
    return { success: true };
  });

export const deleteStudent = actionClient
  .schema(deleteStudentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const studentResult = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.id, parsedInput.id))
      .limit(1);

    if (studentResult.length === 0) {
      throw new Error("Aluno não encontrado");
    }

    await db.delete(studentsTable).where(eq(studentsTable.id, parsedInput.id));

    revalidatePath("/dashboard/alunos");
    return { success: true };
  });

export const getStudent = actionClient
  .schema(getStudentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const studentResult = await db
      .select()
      .from(studentsTable)
      .where(eq(studentsTable.id, parsedInput.id))
      .limit(1);

    if (studentResult.length === 0) {
      throw new Error("Aluno não encontrado");
    }

    const student = studentResult[0];

    const userResult = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, student.userId))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    const user = userResult[0];

    return {
      student: {
        ...student,
        user,
      },
    };
  });

export async function getStudents() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const students = await db
    .select({
      student: studentsTable,
      user: usersTable,
    })
    .from(studentsTable)
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .orderBy(desc(studentsTable.createdAt));

  return students.map((item) => ({
    ...item.student,
    user: item.user,
  }));
}
