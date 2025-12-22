import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: z.enum(["admin", "student", "teacher"]).default("student"),
});

export const updateUserRoleSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  role: z.enum(["admin", "student", "teacher"]),
});

export const deleteUserSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
