"use server";

import { nanoid } from "nanoid";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db/index";
import {
  materialsTable,
  materialMovementsTable,
  usersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

import { actionClient } from "../create-safe-action-client";
import {
  createMaterialSchema,
  updateMaterialSchema,
  deleteMaterialSchema,
  getMaterialSchema,
  addMaterialMovementSchema,
} from "./schema";

export const createMaterial = actionClient
  .schema(createMaterialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const materialId = nanoid();

    const priceValue = parsedInput.price
      ? parsedInput.price.replace(/[^\d,.-]/g, "").replace(",", ".")
      : null;

    await db.insert(materialsTable).values({
      id: materialId,
      name: parsedInput.name,
      description: parsedInput.description || null,
      category: parsedInput.category || null,
      quantity: parsedInput.quantity,
      minQuantity: parsedInput.minQuantity || 0,
      unit: parsedInput.unit,
      price: priceValue,
      supplier: parsedInput.supplier || null,
      location: parsedInput.location || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/estoque");
    return { success: true, id: materialId };
  });

export const updateMaterial = actionClient
  .schema(updateMaterialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const materialResult = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.id, parsedInput.id))
      .limit(1);

    if (materialResult.length === 0) {
      throw new Error("Material não encontrado");
    }

    const priceValue = parsedInput.price
      ? parsedInput.price.replace(/[^\d,.-]/g, "").replace(",", ".")
      : undefined;

    await db
      .update(materialsTable)
      .set({
        ...(parsedInput.name && { name: parsedInput.name }),
        ...(parsedInput.description !== undefined && {
          description: parsedInput.description,
        }),
        ...(parsedInput.category !== undefined && {
          category: parsedInput.category,
        }),
        ...(parsedInput.quantity !== undefined && {
          quantity: parsedInput.quantity,
        }),
        ...(parsedInput.minQuantity !== undefined && {
          minQuantity: parsedInput.minQuantity,
        }),
        ...(parsedInput.unit && { unit: parsedInput.unit }),
        ...(priceValue !== undefined && { price: priceValue }),
        ...(parsedInput.supplier !== undefined && {
          supplier: parsedInput.supplier,
        }),
        ...(parsedInput.location !== undefined && {
          location: parsedInput.location,
        }),
        updatedAt: new Date(),
      })
      .where(eq(materialsTable.id, parsedInput.id));

    revalidatePath("/estoque");
    return { success: true };
  });

export const deleteMaterial = actionClient
  .schema(deleteMaterialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const materialResult = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.id, parsedInput.id))
      .limit(1);

    if (materialResult.length === 0) {
      throw new Error("Material não encontrado");
    }

    await db
      .delete(materialsTable)
      .where(eq(materialsTable.id, parsedInput.id));

    revalidatePath("/estoque");
    return { success: true };
  });

export const getMaterial = actionClient
  .schema(getMaterialSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const materialResult = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.id, parsedInput.id))
      .limit(1);

    if (materialResult.length === 0) {
      throw new Error("Material não encontrado");
    }

    const material = materialResult[0];

    return { material };
  });

export const addMaterialMovement = actionClient
  .schema(addMaterialMovementSchema)
  .action(async ({ parsedInput, ctx }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Não autenticado");
    }

    const materialResult = await db
      .select()
      .from(materialsTable)
      .where(eq(materialsTable.id, parsedInput.materialId))
      .limit(1);

    if (materialResult.length === 0) {
      throw new Error("Material não encontrado");
    }

    const material = materialResult[0];
    const movementId = nanoid();

    const newQuantity =
      parsedInput.type === "entry"
        ? material.quantity + parsedInput.quantity
        : material.quantity - parsedInput.quantity;

    if (newQuantity < 0) {
      throw new Error("Quantidade insuficiente em estoque");
    }

    await db.transaction(async (tx) => {
      await tx.insert(materialMovementsTable).values({
        id: movementId,
        materialId: parsedInput.materialId,
        type: parsedInput.type,
        quantity: parsedInput.quantity,
        reason: parsedInput.reason || null,
        userId: ctx.userId,
        createdAt: new Date(),
      });

      await tx
        .update(materialsTable)
        .set({
          quantity: newQuantity,
          updatedAt: new Date(),
        })
        .where(eq(materialsTable.id, parsedInput.materialId));
    });

    revalidatePath("/estoque");
    return { success: true };
  });

export async function getMaterials() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const materials = await db
    .select()
    .from(materialsTable)
    .orderBy(desc(materialsTable.createdAt));

  return materials;
}

export async function getMaterialMovements(materialId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Não autenticado");
  }

  const movements = await db
    .select({
      movement: materialMovementsTable,
      user: usersTable,
    })
    .from(materialMovementsTable)
    .leftJoin(usersTable, eq(materialMovementsTable.userId, usersTable.id))
    .where(eq(materialMovementsTable.materialId, materialId))
    .orderBy(desc(materialMovementsTable.createdAt));

  return movements.map((item) => ({
    ...item.movement,
    user: item.user,
  }));
}
