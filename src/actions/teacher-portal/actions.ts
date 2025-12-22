"use server";

import { nanoid } from "nanoid";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  attendanceTable,
  gradesTable,
  assignmentsTable,
  teachersTable,
  coursesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "../create-safe-action-client";
import {
  createAttendanceSchema,
  updateAttendanceSchema,
  createGradeSchema,
  updateGradeSchema,
  deleteGradeSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
  deleteAssignmentSchema,
} from "./schema";

export const createAttendance = actionClient
  .schema(createAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const attendanceId = nanoid();
    const date = new Date(parsedInput.date);
    date.setHours(0, 0, 0, 0);

    await db.insert(attendanceTable).values({
      id: attendanceId,
      enrollmentId: parsedInput.enrollmentId,
      date,
      status: parsedInput.status,
      notes: parsedInput.notes || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/portal-professor");
    return { success: true, id: attendanceId };
  });

export const updateAttendance = actionClient
  .schema(updateAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const date = new Date(parsedInput.date);
    date.setHours(0, 0, 0, 0);

    await db
      .update(attendanceTable)
      .set({
        date,
        status: parsedInput.status,
        notes: parsedInput.notes || null,
        updatedAt: new Date(),
      })
      .where(eq(attendanceTable.id, parsedInput.id));

    revalidatePath("/portal-professor");
    return { success: true };
  });

export const createGrade = actionClient
  .schema(createGradeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const gradeId = nanoid();
    const gradeValue = parsedInput.grade
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");

    await db.insert(gradesTable).values({
      id: gradeId,
      enrollmentId: parsedInput.enrollmentId,
      assignmentId: parsedInput.assignmentId || null,
      grade: gradeValue,
      type: parsedInput.type,
      description: parsedInput.description || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/portal-professor");
    return { success: true, id: gradeId };
  });

export const updateGrade = actionClient
  .schema(updateGradeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const gradeValue = parsedInput.grade
      ? parsedInput.grade.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(gradesTable)
      .set({
        ...(gradeValue !== undefined && { grade: gradeValue }),
        ...(parsedInput.type && { type: parsedInput.type }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        ...(parsedInput.assignmentId !== undefined && {
          assignmentId: parsedInput.assignmentId,
        }),
        updatedAt: new Date(),
      })
      .where(eq(gradesTable.id, parsedInput.id));

    revalidatePath("/portal-professor");
    return { success: true };
  });

export const deleteGrade = actionClient
  .schema(deleteGradeSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    await db.delete(gradesTable).where(eq(gradesTable.id, parsedInput.id));

    revalidatePath("/portal-professor");
    return { success: true };
  });

export const createAssignment = actionClient
  .schema(createAssignmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacher = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.userId, session.user.id))
      .limit(1);

    if (teacher.length === 0) {
      throw new Error("Professor não encontrado");
    }

    const course = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.id, parsedInput.courseId),
          eq(coursesTable.teacherId, teacher[0].id),
        ),
      )
      .limit(1);

    if (course.length === 0) {
      throw new Error("Curso não encontrado ou você não tem permissão");
    }

    const assignmentId = nanoid();
    const maxGradeValue = parsedInput.maxGrade
      ? parsedInput.maxGrade.replace(/[^\d,.-]/g, "").replace(",", ".")
      : null;

    await db.insert(assignmentsTable).values({
      id: assignmentId,
      courseId: parsedInput.courseId,
      teacherId: teacher[0].id,
      title: parsedInput.title,
      description: parsedInput.description || null,
      type: parsedInput.type,
      dueDate: parsedInput.dueDate,
      maxGrade: maxGradeValue,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/portal-professor");
    return { success: true, id: assignmentId };
  });

export const updateAssignment = actionClient
  .schema(updateAssignmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacher = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.userId, session.user.id))
      .limit(1);

    if (teacher.length === 0) {
      throw new Error("Professor não encontrado");
    }

    const assignment = await db
      .select()
      .from(assignmentsTable)
      .where(
        and(
          eq(assignmentsTable.id, parsedInput.id),
          eq(assignmentsTable.teacherId, teacher[0].id),
        ),
      )
      .limit(1);

    if (assignment.length === 0) {
      throw new Error("Tarefa não encontrada ou você não tem permissão");
    }

    const maxGradeValue = parsedInput.maxGrade
      ? parsedInput.maxGrade.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(assignmentsTable)
      .set({
        ...(parsedInput.title && { title: parsedInput.title }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        ...(parsedInput.type && { type: parsedInput.type }),
        ...(parsedInput.dueDate && { dueDate: parsedInput.dueDate }),
        ...(maxGradeValue !== undefined && { maxGrade: maxGradeValue }),
        updatedAt: new Date(),
      })
      .where(eq(assignmentsTable.id, parsedInput.id));

    revalidatePath("/portal-professor");
    return { success: true };
  });

export const deleteAssignment = actionClient
  .schema(deleteAssignmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const teacher = await db
      .select()
      .from(teachersTable)
      .where(eq(teachersTable.userId, session.user.id))
      .limit(1);

    if (teacher.length === 0) {
      throw new Error("Professor não encontrado");
    }

    const assignment = await db
      .select()
      .from(assignmentsTable)
      .where(
        and(
          eq(assignmentsTable.id, parsedInput.id),
          eq(assignmentsTable.teacherId, teacher[0].id),
        ),
      )
      .limit(1);

    if (assignment.length === 0) {
      throw new Error("Tarefa não encontrada ou você não tem permissão");
    }

    await db
      .delete(assignmentsTable)
      .where(eq(assignmentsTable.id, parsedInput.id));

    revalidatePath("/portal-professor");
    return { success: true };
  });
