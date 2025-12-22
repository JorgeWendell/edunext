"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import {
  coursesTable,
  teachersTable,
  classroomsTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createCourseSchema,
  updateCourseSchema,
  deleteCourseSchema,
  getCourseSchema,
} from "./schema";

export const createCourse = actionClient
  .schema(createCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const courseId = nanoid();

    const existingCode = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.code, parsedInput.code))
      .limit(1);

    if (existingCode.length > 0) {
      throw new Error("Código do curso já cadastrado");
    }

    const priceValue = parsedInput.price
      ? parsedInput.price.replace(/[^\d,.-]/g, "").replace(",", ".")
      : "0";

    await db.insert(coursesTable).values({
      id: courseId,
      name: parsedInput.name,
      code: parsedInput.code,
      description: parsedInput.description || null,
      duration: parsedInput.duration || null,
      price: priceValue,
      teacherId: parsedInput.teacherId || null,
      classroomId: parsedInput.classroomId || null,
      schedule: parsedInput.schedule || null,
      startDate: parsedInput.startDate || null,
      endDate: parsedInput.endDate || null,
      status: parsedInput.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/cursos");
    return { success: true, id: courseId };
  });

export const updateCourse = actionClient
  .schema(updateCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, parsedInput.id))
      .limit(1);

    if (courseResult.length === 0) {
      throw new Error("Curso não encontrado");
    }

    const course = courseResult[0];

    if (parsedInput.code && parsedInput.code !== course.code) {
      const existingCode = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.code, parsedInput.code))
        .limit(1);

      if (existingCode.length > 0) {
        throw new Error("Código do curso já cadastrado");
      }
    }

    const priceValue = parsedInput.price
      ? parsedInput.price.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(coursesTable)
      .set({
        ...(parsedInput.name && { name: parsedInput.name }),
        ...(parsedInput.code && { code: parsedInput.code }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        ...(parsedInput.duration !== undefined && {
          duration: parsedInput.duration,
        }),
        ...(priceValue !== undefined && { price: priceValue }),
        ...(parsedInput.teacherId !== undefined && {
          teacherId: parsedInput.teacherId,
        }),
        ...(parsedInput.classroomId !== undefined && {
          classroomId: parsedInput.classroomId,
        }),
        ...(parsedInput.schedule !== undefined && {
          schedule: parsedInput.schedule,
        }),
        ...(parsedInput.startDate && { startDate: parsedInput.startDate }),
        ...(parsedInput.endDate && { endDate: parsedInput.endDate }),
        ...(parsedInput.status && { status: parsedInput.status }),
        updatedAt: new Date(),
      })
      .where(eq(coursesTable.id, parsedInput.id));

    revalidatePath("/cursos");
    return { success: true };
  });

export const deleteCourse = actionClient
  .schema(deleteCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, parsedInput.id))
      .limit(1);

    if (courseResult.length === 0) {
      throw new Error("Curso não encontrado");
    }

    await db.delete(coursesTable).where(eq(coursesTable.id, parsedInput.id));

    revalidatePath("/cursos");
    return { success: true };
  });

export const getCourse = actionClient
  .schema(getCourseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const courseResult = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.id, parsedInput.id))
      .limit(1);

    if (courseResult.length === 0) {
      throw new Error("Curso não encontrado");
    }

    const course = courseResult[0];

    let teacher = null;
    let classroom = null;

    if (course.teacherId) {
      const teacherResult = await db
        .select({
          teacher: teachersTable,
          user: usersTable,
        })
        .from(teachersTable)
        .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
        .where(eq(teachersTable.id, course.teacherId))
        .limit(1);

      if (teacherResult.length > 0) {
        teacher = {
          ...teacherResult[0].teacher,
          user: teacherResult[0].user,
        };
      }
    }

    if (course.classroomId) {
      const classroomResult = await db
        .select()
        .from(classroomsTable)
        .where(eq(classroomsTable.id, course.classroomId))
        .limit(1);

      if (classroomResult.length > 0) {
        classroom = classroomResult[0];
      }
    }

    return {
      course: {
        ...course,
        teacher,
        classroom,
      },
    };
  });

export async function getCourses() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const courses = await db
    .select({
      course: coursesTable,
      teacher: teachersTable,
      teacherUser: usersTable,
      classroom: classroomsTable,
    })
    .from(coursesTable)
    .leftJoin(teachersTable, eq(coursesTable.teacherId, teachersTable.id))
    .leftJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .leftJoin(classroomsTable, eq(coursesTable.classroomId, classroomsTable.id))
    .orderBy(desc(coursesTable.createdAt));

  return courses.map((item) => ({
    ...item.course,
    teacher:
      item.teacher && item.teacherUser
        ? {
            ...item.teacher,
            user: item.teacherUser,
          }
        : null,
    classroom: item.classroom,
  }));
}

export async function getTeachersForSelect() {
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
    .where(eq(teachersTable.status, "active"))
    .orderBy(usersTable.name);

  return teachers.map((item) => ({
    id: item.teacher.id,
    name: item.user.name,
  }));
}

export async function getClassroomsForSelect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const classrooms = await db
    .select()
    .from(classroomsTable)
    .where(eq(classroomsTable.status, "available"))
    .orderBy(classroomsTable.name);

  return classrooms;
}
