import { z } from "zod";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
  cpf: z.string().min(11, "CPF inválido").max(14),
  phone: z.string().optional(),
  birthDate: z.date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z
    .string()
    .email("E-mail do responsável inválido")
    .optional()
    .or(z.literal("")),
  enrollmentNumber: z.string().min(1, "Número de matrícula é obrigatório"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const updateStudentSchema = createStudentSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .optional()
    .or(z.literal("")),
});

export const deleteStudentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const getStudentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
