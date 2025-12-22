"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import { classroomsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createClassroomSchema,
  updateClassroomSchema,
  deleteClassroomSchema,
  getClassroomSchema,
} from "./schema";

export const createClassroom = actionClient
  .schema(createClassroomSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const classroomId = nanoid();

    const existingName = await db
      .select()
      .from(classroomsTable)
      .where(eq(classroomsTable.name, parsedInput.name))
      .limit(1);

    if (existingName.length > 0) {
      throw new Error("Nome da sala já cadastrado");
    }

    await db.insert(classroomsTable).values({
      id: classroomId,
      name: parsedInput.name,
      capacity: parsedInput.capacity,
      location: parsedInput.location || null,
      description: parsedInput.description || null,
      status: parsedInput.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/salas");
    return { success: true, id: classroomId };
  });

export const updateClassroom = actionClient
  .schema(updateClassroomSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const classroomResult = await db
      .select()
      .from(classroomsTable)
      .where(eq(classroomsTable.id, parsedInput.id))
      .limit(1);

    if (classroomResult.length === 0) {
      throw new Error("Sala não encontrada");
    }

    const classroom = classroomResult[0];

    if (parsedInput.name && parsedInput.name !== classroom.name) {
      const existingName = await db
        .select()
        .from(classroomsTable)
        .where(eq(classroomsTable.name, parsedInput.name))
        .limit(1);

      if (existingName.length > 0) {
        throw new Error("Nome da sala já cadastrado");
      }
    }

    await db
      .update(classroomsTable)
      .set({
        ...(parsedInput.name && { name: parsedInput.name }),
        ...(parsedInput.capacity !== undefined && {
          capacity: parsedInput.capacity,
        }),
        ...(parsedInput.location !== undefined && {
          location: parsedInput.location,
        }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        ...(parsedInput.status && { status: parsedInput.status }),
        updatedAt: new Date(),
      })
      .where(eq(classroomsTable.id, parsedInput.id));

    revalidatePath("/salas");
    return { success: true };
  });

export const deleteClassroom = actionClient
  .schema(deleteClassroomSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const classroomResult = await db
      .select()
      .from(classroomsTable)
      .where(eq(classroomsTable.id, parsedInput.id))
      .limit(1);

    if (classroomResult.length === 0) {
      throw new Error("Sala não encontrada");
    }

    await db
      .delete(classroomsTable)
      .where(eq(classroomsTable.id, parsedInput.id));

    revalidatePath("/salas");
    return { success: true };
  });

export const getClassroom = actionClient
  .schema(getClassroomSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const classroomResult = await db
      .select()
      .from(classroomsTable)
      .where(eq(classroomsTable.id, parsedInput.id))
      .limit(1);

    if (classroomResult.length === 0) {
      throw new Error("Sala não encontrada");
    }

    const classroom = classroomResult[0];

    return { classroom };
  });

export async function getClassrooms() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const classrooms = await db
    .select()
    .from(classroomsTable)
    .orderBy(desc(classroomsTable.createdAt));

  return classrooms;
}
