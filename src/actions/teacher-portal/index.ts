"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  teachersTable,
  coursesTable,
  enrollmentsTable,
  studentsTable,
  usersTable,
  attendanceTable,
  gradesTable,
  assignmentsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getTeacherCourses() {
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
    return [];
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.teacherId, teacher[0].id),
        eq(coursesTable.status, "active"),
      ),
    )
    .orderBy(desc(coursesTable.createdAt));

  return courses;
}

export async function getCourseEnrollments(courseId: string) {
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
    return [];
  }

  const course = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.id, courseId),
        eq(coursesTable.teacherId, teacher[0].id),
      ),
    )
    .limit(1);

  if (course.length === 0) {
    throw new Error("Curso não encontrado ou você não tem permissão");
  }

  const enrollments = await db
    .select({
      enrollment: enrollmentsTable,
      student: studentsTable,
      studentUser: usersTable,
    })
    .from(enrollmentsTable)
    .innerJoin(studentsTable, eq(enrollmentsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .where(
      and(
        eq(enrollmentsTable.courseId, courseId),
        eq(enrollmentsTable.status, "active"),
      ),
    )
    .orderBy(usersTable.name);

  return enrollments.map((item) => ({
    ...item.enrollment,
    student: {
      ...item.student,
      user: item.studentUser,
    },
  }));
}

export async function getCourseAttendance(courseId: string, date: Date) {
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
    return [];
  }

  const course = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.id, courseId),
        eq(coursesTable.teacherId, teacher[0].id),
      ),
    )
    .limit(1);

  if (course.length === 0) {
    throw new Error("Curso não encontrado ou você não tem permissão");
  }

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.courseId, courseId),
        eq(enrollmentsTable.status, "active"),
      ),
    );

  if (enrollments.length === 0) {
    return [];
  }

  const enrollmentIds = enrollments.map((e) => e.id);

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const allAttendance = await db
    .select({
      attendance: attendanceTable,
      enrollment: enrollmentsTable,
      student: studentsTable,
      studentUser: usersTable,
    })
    .from(attendanceTable)
    .innerJoin(
      enrollmentsTable,
      eq(attendanceTable.enrollmentId, enrollmentsTable.id),
    )
    .innerJoin(studentsTable, eq(enrollmentsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .where(inArray(attendanceTable.enrollmentId, enrollmentIds));

  const attendance = allAttendance.filter((item) => {
    const attendanceDate = new Date(item.attendance.date);
    attendanceDate.setHours(0, 0, 0, 0);
    return attendanceDate.getTime() === startOfDay.getTime();
  });

  return attendance.map((item) => ({
    ...item.attendance,
    enrollment: item.enrollment,
    student: {
      ...item.student,
      user: item.studentUser,
    },
  }));
}

export async function getCourseGrades(courseId: string) {
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
    return [];
  }

  const course = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.id, courseId),
        eq(coursesTable.teacherId, teacher[0].id),
      ),
    )
    .limit(1);

  if (course.length === 0) {
    throw new Error("Curso não encontrado ou você não tem permissão");
  }

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.courseId, courseId),
        eq(enrollmentsTable.status, "active"),
      ),
    );

  if (enrollments.length === 0) {
    return [];
  }

  const enrollmentIds = enrollments.map((e) => e.id);

  const grades = await db
    .select({
      grade: gradesTable,
      enrollment: enrollmentsTable,
      student: studentsTable,
      studentUser: usersTable,
      assignment: assignmentsTable,
    })
    .from(gradesTable)
    .innerJoin(
      enrollmentsTable,
      eq(gradesTable.enrollmentId, enrollmentsTable.id),
    )
    .innerJoin(studentsTable, eq(enrollmentsTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .leftJoin(
      assignmentsTable,
      eq(gradesTable.assignmentId, assignmentsTable.id),
    )
    .where(inArray(gradesTable.enrollmentId, enrollmentIds))
    .orderBy(desc(gradesTable.createdAt));

  return grades.map((item) => ({
    ...item.grade,
    enrollment: item.enrollment,
    student: {
      ...item.student,
      user: item.studentUser,
    },
    assignment: item.assignment,
  }));
}

export async function getCourseAssignments(courseId: string) {
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
    return [];
  }

  const course = await db
    .select()
    .from(coursesTable)
    .where(
      and(
        eq(coursesTable.id, courseId),
        eq(coursesTable.teacherId, teacher[0].id),
      ),
    )
    .limit(1);

  if (course.length === 0) {
    throw new Error("Curso não encontrado ou você não tem permissão");
  }

  const assignments = await db
    .select()
    .from(assignmentsTable)
    .where(
      and(
        eq(assignmentsTable.courseId, courseId),
        eq(assignmentsTable.teacherId, teacher[0].id),
      ),
    )
    .orderBy(assignmentsTable.dueDate);

  return assignments;
}
