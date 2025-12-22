import { z } from "zod";

export const createFinancialTransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  category: z.string().min(1, "Categoria é obrigatória"),
  description: z.string().min(1, "Descrição é obrigatória"),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.date(),
  paymentDate: z.date().optional(),
  status: z.enum(["pending", "paid", "overdue"]).default("pending"),
  studentId: z.string().optional(),
  teacherId: z.string().optional(),
  courseId: z.string().optional(),
});

export const updateFinancialTransactionSchema = createFinancialTransactionSchema
  .partial()
  .extend({
    id: z.string().min(1, "ID é obrigatório"),
    amount: z.string().optional(),
  });

export const deleteFinancialTransactionSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const createInvoiceSchema = z.object({
  studentId: z.string().min(1, "Aluno é obrigatório"),
  enrollmentId: z.string().optional(),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.date(),
  description: z.string().optional(),
});

export const updateInvoiceSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  status: z.enum(["pending", "paid", "overdue"]).optional(),
  paymentDate: z.date().optional(),
});

export const createPaymentSchema = z.object({
  teacherId: z.string().min(1, "Professor é obrigatório"),
  amount: z.string().min(1, "Valor é obrigatório"),
  paymentDate: z.date(),
  referenceMonth: z.string().min(1, "Mês de referência é obrigatório"),
  referenceYear: z.number().int().min(2000).max(2100),
  description: z.string().optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  amount: z.string().optional(),
});

export const deletePaymentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
