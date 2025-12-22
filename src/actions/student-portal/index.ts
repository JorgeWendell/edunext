"use server";

import { eq, and, desc, inArray } from "drizzle-orm";
import { headers } from "next/headers";

import { db } from "@/db/index";
import {
  studentsTable,
  enrollmentsTable,
  coursesTable,
  attendanceTable,
  gradesTable,
  assignmentsTable,
  invoicesTable,
  teachersTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getStudentEnrollments() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const enrollments = await db
    .select({
      enrollment: enrollmentsTable,
      course: coursesTable,
      teacher: teachersTable,
      teacherUser: usersTable,
    })
    .from(enrollmentsTable)
    .innerJoin(coursesTable, eq(enrollmentsTable.courseId, coursesTable.id))
    .leftJoin(teachersTable, eq(coursesTable.teacherId, teachersTable.id))
    .leftJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .where(
      and(
        eq(enrollmentsTable.studentId, student[0].id),
        eq(enrollmentsTable.status, "active"),
      ),
    )
    .orderBy(desc(enrollmentsTable.enrollmentDate));

  return enrollments.map((item) => ({
    ...item.enrollment,
    course: {
      ...item.course,
      teacher:
        item.teacher && item.teacherUser
          ? {
              ...item.teacher,
              user: item.teacherUser,
            }
          : null,
    },
  }));
}

export async function getStudentAttendance(enrollmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const enrollment = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.id, enrollmentId),
        eq(enrollmentsTable.studentId, student[0].id),
      ),
    )
    .limit(1);

  if (enrollment.length === 0) {
    throw new Error("Matrícula não encontrada");
  }

  const attendance = await db
    .select()
    .from(attendanceTable)
    .where(eq(attendanceTable.enrollmentId, enrollmentId))
    .orderBy(desc(attendanceTable.date));

  return attendance;
}

export async function getStudentGrades(enrollmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const enrollment = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.id, enrollmentId),
        eq(enrollmentsTable.studentId, student[0].id),
      ),
    )
    .limit(1);

  if (enrollment.length === 0) {
    throw new Error("Matrícula não encontrada");
  }

  const grades = await db
    .select({
      grade: gradesTable,
      assignment: assignmentsTable,
    })
    .from(gradesTable)
    .leftJoin(
      assignmentsTable,
      eq(gradesTable.assignmentId, assignmentsTable.id),
    )
    .where(eq(gradesTable.enrollmentId, enrollmentId))
    .orderBy(desc(gradesTable.createdAt));

  return grades.map((item) => ({
    ...item.grade,
    assignment: item.assignment,
  }));
}

export async function getStudentInvoices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const invoices = await db
    .select()
    .from(invoicesTable)
    .where(eq(invoicesTable.studentId, student[0].id))
    .orderBy(desc(invoicesTable.createdAt));

  return invoices;
}

export async function getStudentAssignments(enrollmentId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const enrollment = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.id, enrollmentId),
        eq(enrollmentsTable.studentId, student[0].id),
      ),
    )
    .limit(1);

  if (enrollment.length === 0) {
    throw new Error("Matrícula não encontrada");
  }

  const assignments = await db
    .select({
      assignment: assignmentsTable,
      teacher: teachersTable,
      teacherUser: usersTable,
    })
    .from(assignmentsTable)
    .innerJoin(teachersTable, eq(assignmentsTable.teacherId, teachersTable.id))
    .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .where(eq(assignmentsTable.courseId, enrollment[0].courseId))
    .orderBy(assignmentsTable.dueDate);

  return assignments.map((item) => ({
    ...item.assignment,
    teacher: {
      ...item.teacher,
      user: item.teacherUser,
    },
  }));
}

export async function getAllStudentAssignments() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const student = await db
    .select()
    .from(studentsTable)
    .where(eq(studentsTable.userId, session.user.id))
    .limit(1);

  if (student.length === 0) {
    return [];
  }

  const enrollments = await db
    .select()
    .from(enrollmentsTable)
    .where(
      and(
        eq(enrollmentsTable.studentId, student[0].id),
        eq(enrollmentsTable.status, "active"),
      ),
    );

  if (enrollments.length === 0) {
    return [];
  }

  const courseIds = enrollments.map((e) => e.courseId);

  if (courseIds.length === 0) {
    return [];
  }

  const assignments = await db
    .select({
      assignment: assignmentsTable,
      course: coursesTable,
      teacher: teachersTable,
      teacherUser: usersTable,
    })
    .from(assignmentsTable)
    .innerJoin(coursesTable, eq(assignmentsTable.courseId, coursesTable.id))
    .innerJoin(teachersTable, eq(assignmentsTable.teacherId, teachersTable.id))
    .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .where(inArray(assignmentsTable.courseId, courseIds))
    .orderBy(assignmentsTable.dueDate);

  return assignments.map((item) => ({
    ...item.assignment,
    course: item.course,
    teacher: {
      ...item.teacher,
      user: item.teacherUser,
    },
  }));
}
