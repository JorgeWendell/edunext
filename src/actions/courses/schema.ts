import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  description: z.string().optional(),
  duration: z.number().int().positive().optional(),
  price: z.string().min(1, "Preço é obrigatório"),
  teacherId: z.string().optional(),
  classroomId: z.string().optional(),
  schedule: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["active", "inactive", "completed"]).default("active"),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  price: z.string().optional(),
});

export const deleteCourseSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const getCourseSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
