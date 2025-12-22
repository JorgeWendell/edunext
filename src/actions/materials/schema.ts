import { z } from "zod";

export const createMaterialSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(0, "Quantidade não pode ser negativa"),
  minQuantity: z
    .number()
    .int()
    .min(0, "Quantidade mínima não pode ser negativa")
    .optional(),
  unit: z.string().min(1, "Unidade é obrigatória").default("unidade"),
  price: z.string().optional(),
  supplier: z.string().optional(),
  location: z.string().optional(),
});

export const updateMaterialSchema = createMaterialSchema.partial().extend({
  id: z.string().min(1, "ID é obrigatório"),
  quantity: z.number().int().min(0).optional(),
  minQuantity: z.number().int().min(0).optional(),
});

export const deleteMaterialSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const getMaterialSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
});

export const addMaterialMovementSchema = z.object({
  materialId: z.string().min(1, "ID do material é obrigatório"),
  type: z.enum(["entry", "exit"]),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  reason: z.string().optional(),
});
