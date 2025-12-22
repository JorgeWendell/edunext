import { z } from "zod";

export const createAttendanceSchema = z.object({
  enrollmentId: z.string().min(1, "Matrícula é obrigatória"),
  date: z.date(),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
});

export const updateAttendanceSchema = createAttendanceSchema.extend({
  id: z.string().min(1, "ID é obrigatório"),
});

export const createGradeSchema = z.object({
  enrollmentId: z.string().min(1, "Matrícula é obrigatória"),
  assignmentId: z.string().optional(),
  grade: z.string().min(1, "Nota é obrigatória"),
  type: z.string().min(1, "Tipo é obrigatório"),
  description: z.string().optional(),
});

export const updateGradeSchema = createGradeSchema.extend({
  id: z.string().min(1, "ID é obrigatório"),
});

export const deleteGradeSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const createAssignmentSchema = z.object({
  courseId: z.string().min(1, "Curso é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["exam", "assignment", "project", "activity"]),
  dueDate: z.date(),
  maxGrade: z.string().optional(),
});

export const updateAssignmentSchema = createAssignmentSchema.extend({
  id: z.string().min(1, "ID é obrigatório"),
  maxGrade: z.string().optional(),
});

export const deleteAssignmentSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});
