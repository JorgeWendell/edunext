"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import {
  financialTransactionsTable,
  invoicesTable,
  paymentsTable,
  studentsTable,
  teachersTable,
  coursesTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createFinancialTransactionSchema,
  updateFinancialTransactionSchema,
  deleteFinancialTransactionSchema,
  createInvoiceSchema,
  updateInvoiceSchema,
  createPaymentSchema,
  updatePaymentSchema,
  deletePaymentSchema,
} from "./schema";

export const createFinancialTransaction = actionClient
  .schema(createFinancialTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const transactionId = nanoid();

    const amountValue = parsedInput.amount
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");

    await db.insert(financialTransactionsTable).values({
      id: transactionId,
      type: parsedInput.type,
      category: parsedInput.category,
      description: parsedInput.description,
      amount: amountValue,
      dueDate: parsedInput.dueDate,
      paymentDate: parsedInput.paymentDate || null,
      status: parsedInput.status,
      studentId: parsedInput.studentId || null,
      teacherId: parsedInput.teacherId || null,
      courseId: parsedInput.courseId || null,
      invoiceId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/financeiro");
    return { success: true, id: transactionId };
  });

export const updateFinancialTransaction = actionClient
  .schema(updateFinancialTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const transactionResult = await db
      .select()
      .from(financialTransactionsTable)
      .where(eq(financialTransactionsTable.id, parsedInput.id))
      .limit(1);

    if (transactionResult.length === 0) {
      throw new Error("Transação não encontrada");
    }

    const amountValue = parsedInput.amount
      ? parsedInput.amount.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(financialTransactionsTable)
      .set({
        ...(parsedInput.type && { type: parsedInput.type }),
        ...(parsedInput.category && { category: parsedInput.category }),
        ...(parsedInput.description && {
          description: parsedInput.description,
        }),
        ...(amountValue !== undefined && { amount: amountValue }),
        ...(parsedInput.dueDate && { dueDate: parsedInput.dueDate }),
        ...(parsedInput.paymentDate !== undefined && {
          paymentDate: parsedInput.paymentDate,
        }),
        ...(parsedInput.status && { status: parsedInput.status }),
        ...(parsedInput.studentId !== undefined && {
          studentId: parsedInput.studentId,
        }),
        ...(parsedInput.teacherId !== undefined && {
          teacherId: parsedInput.teacherId,
        }),
        ...(parsedInput.courseId !== undefined && {
          courseId: parsedInput.courseId,
        }),
        updatedAt: new Date(),
      })
      .where(eq(financialTransactionsTable.id, parsedInput.id));

    revalidatePath("/financeiro");
    return { success: true };
  });

export const deleteFinancialTransaction = actionClient
  .schema(deleteFinancialTransactionSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const transactionResult = await db
      .select()
      .from(financialTransactionsTable)
      .where(eq(financialTransactionsTable.id, parsedInput.id))
      .limit(1);

    if (transactionResult.length === 0) {
      throw new Error("Transação não encontrada");
    }

    await db
      .delete(financialTransactionsTable)
      .where(eq(financialTransactionsTable.id, parsedInput.id));

    revalidatePath("/financeiro");
    return { success: true };
  });

export const createInvoice = actionClient
  .schema(createInvoiceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const invoiceId = nanoid();
    const invoiceNumber = `INV-${Date.now()}`;
    const amountValue = parsedInput.amount
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");

    await db.insert(invoicesTable).values({
      id: invoiceId,
      studentId: parsedInput.studentId,
      enrollmentId: parsedInput.enrollmentId || null,
      invoiceNumber,
      amount: amountValue,
      dueDate: parsedInput.dueDate,
      paymentDate: null,
      status: "pending",
      barcode: null,
      pdfUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/financeiro");
    return { success: true, id: invoiceId };
  });

export const updateInvoice = actionClient
  .schema(updateInvoiceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const invoiceResult = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, parsedInput.id))
      .limit(1);

    if (invoiceResult.length === 0) {
      throw new Error("Fatura não encontrada");
    }

    await db
      .update(invoicesTable)
      .set({
        ...(parsedInput.status && { status: parsedInput.status }),
        ...(parsedInput.paymentDate !== undefined && {
          paymentDate: parsedInput.paymentDate,
        }),
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.id, parsedInput.id));

    revalidatePath("/financeiro");
    return { success: true };
  });

export const createPayment = actionClient
  .schema(createPaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const paymentId = nanoid();
    const amountValue = parsedInput.amount
      .replace(/[^\d,.-]/g, "")
      .replace(",", ".");

    await db.insert(paymentsTable).values({
      id: paymentId,
      teacherId: parsedInput.teacherId,
      amount: amountValue,
      paymentDate: parsedInput.paymentDate,
      referenceMonth: parsedInput.referenceMonth,
      referenceYear: parsedInput.referenceYear,
      description: parsedInput.description || null,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/financeiro");
    return { success: true, id: paymentId };
  });

export const updatePayment = actionClient
  .schema(updatePaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const paymentResult = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, parsedInput.id))
      .limit(1);

    if (paymentResult.length === 0) {
      throw new Error("Pagamento não encontrado");
    }

    const amountValue = parsedInput.amount
      ? parsedInput.amount.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(paymentsTable)
      .set({
        ...(parsedInput.teacherId && { teacherId: parsedInput.teacherId }),
        ...(amountValue !== undefined && { amount: amountValue }),
        ...(parsedInput.paymentDate && {
          paymentDate: parsedInput.paymentDate,
        }),
        ...(parsedInput.referenceMonth && {
          referenceMonth: parsedInput.referenceMonth,
        }),
        ...(parsedInput.referenceYear && {
          referenceYear: parsedInput.referenceYear,
        }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        updatedAt: new Date(),
      })
      .where(eq(paymentsTable.id, parsedInput.id));

    revalidatePath("/financeiro");
    return { success: true };
  });

export const deletePayment = actionClient
  .schema(deletePaymentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const paymentResult = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, parsedInput.id))
      .limit(1);

    if (paymentResult.length === 0) {
      throw new Error("Pagamento não encontrado");
    }

    await db.delete(paymentsTable).where(eq(paymentsTable.id, parsedInput.id));

    revalidatePath("/financeiro");
    return { success: true };
  });

export async function getFinancialTransactions() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const transactions = await db
    .select()
    .from(financialTransactionsTable)
    .orderBy(desc(financialTransactionsTable.createdAt));

  const transactionsWithRelations = await Promise.all(
    transactions.map(async (transaction) => {
      let student = null;
      let teacher = null;
      let course = null;

      if (transaction.studentId) {
        const studentResult = await db
          .select({
            student: studentsTable,
            user: usersTable,
          })
          .from(studentsTable)
          .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
          .where(eq(studentsTable.id, transaction.studentId))
          .limit(1);

        if (studentResult.length > 0) {
          student = {
            ...studentResult[0].student,
            user: studentResult[0].user,
          };
        }
      }

      if (transaction.teacherId) {
        const teacherResult = await db
          .select({
            teacher: teachersTable,
            user: usersTable,
          })
          .from(teachersTable)
          .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
          .where(eq(teachersTable.id, transaction.teacherId))
          .limit(1);

        if (teacherResult.length > 0) {
          teacher = {
            ...teacherResult[0].teacher,
            user: teacherResult[0].user,
          };
        }
      }

      if (transaction.courseId) {
        const courseResult = await db
          .select()
          .from(coursesTable)
          .where(eq(coursesTable.id, transaction.courseId))
          .limit(1);

        if (courseResult.length > 0) {
          course = courseResult[0];
        }
      }

      return {
        ...transaction,
        student,
        teacher,
        course,
      };
    }),
  );

  return transactionsWithRelations;
}

export async function getInvoices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const invoices = await db
    .select({
      invoice: invoicesTable,
      student: studentsTable,
      user: usersTable,
    })
    .from(invoicesTable)
    .innerJoin(studentsTable, eq(invoicesTable.studentId, studentsTable.id))
    .innerJoin(usersTable, eq(studentsTable.userId, usersTable.id))
    .orderBy(desc(invoicesTable.createdAt));

  return invoices.map((item) => ({
    ...item.invoice,
    student: {
      ...item.student,
      user: item.user,
    },
  }));
}

export async function getPayments() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const payments = await db
    .select({
      payment: paymentsTable,
      teacher: teachersTable,
      user: usersTable,
    })
    .from(paymentsTable)
    .innerJoin(teachersTable, eq(paymentsTable.teacherId, teachersTable.id))
    .innerJoin(usersTable, eq(teachersTable.userId, usersTable.id))
    .orderBy(desc(paymentsTable.createdAt));

  return payments.map((item) => ({
    ...item.payment,
    teacher: {
      ...item.teacher,
      user: item.user,
    },
  }));
}

export async function getStudentsForSelect() {
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
    .where(eq(studentsTable.status, "active"))
    .orderBy(usersTable.name);

  return students.map((item) => ({
    id: item.student.id,
    name: item.user.name,
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

export async function getCoursesForSelect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const courses = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.status, "active"))
    .orderBy(coursesTable.name);

  return courses.map((course) => ({
    id: course.id,
    name: course.name,
  }));
}
