import { z } from "zod";

export const createTeacherSchema = z.object({
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
  specialization: z.string().optional(),
  hireDate: z.date(),
  salary: z.string().optional(),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

export const updateTeacherSchema = createTeacherSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .optional()
    .or(z.literal("")),
  hireDate: z.date().optional(),
});

export const deleteTeacherSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const getTeacherSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
