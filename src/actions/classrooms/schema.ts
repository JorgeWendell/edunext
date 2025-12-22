import { z } from "zod";

export const createClassroomSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  capacity: z.number().int().positive("Capacidade deve ser um número positivo"),
  location: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(["available", "occupied", "maintenance"]).default("available"),
});

export const updateClassroomSchema = createClassroomSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  capacity: z
    .number()
    .int()
    .positive("Capacidade deve ser um número positivo")
    .optional(),
});

export const deleteClassroomSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const getClassroomSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
