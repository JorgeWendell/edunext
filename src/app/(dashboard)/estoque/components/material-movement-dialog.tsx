"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const movementSchema = z.object({
  type: z.enum(["entry", "exit"]),
  quantity: z.number().int().positive("Quantidade deve ser positiva"),
  reason: z.string().optional(),
});

type MovementValues = z.infer<typeof movementSchema>;

interface MaterialMovementDialogProps {
  materialId: string;
  materialName: string;
  currentQuantity: number;
  onSubmit: (values: MovementValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function MaterialMovementDialog({
  materialId,
  materialName,
  currentQuantity,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: MaterialMovementDialogProps) {
  const form = useForm<MovementValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: "entry",
      quantity: 1,
      reason: "",
    },
  });

  const movementType = form.watch("type");
  const quantity = form.watch("quantity");

  async function handleSubmit(values: MovementValues) {
    await onSubmit(values);
  }

  return (
    <DialogContent className="sm:max-w-md" showCloseButton={true}>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {movementType === "entry" ? (
            <ArrowUp className="h-5 w-5 text-green-600" />
          ) : (
            <ArrowDown className="h-5 w-5 text-red-600" />
          )}
          {movementType === "entry" ? "Entrada" : "Saída"} de Material
        </DialogTitle>
        <DialogDescription>
          Material: <strong>{materialName}</strong>
          <br />
          Estoque atual: <strong>{currentQuantity}</strong>
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Movimentação</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="entry">Entrada</SelectItem>
                    <SelectItem value="exit">Saída</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    value={field.value || ""}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === "" ? 1 : Number(e.target.value),
                      )
                    }
                    placeholder="1"
                    min={1}
                  />
                </FormControl>
                {movementType === "exit" && quantity > currentQuantity && (
                  <p className="text-destructive text-sm">
                    Quantidade insuficiente em estoque
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reason"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descreva o motivo da movimentação..."
                    className="min-h-[80px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {movementType === "entry" && (
            <div className="rounded-lg bg-green-50 p-3 dark:bg-green-900/20">
              <p className="text-sm text-green-800 dark:text-green-300">
                Estoque após entrada:{" "}
                <strong>{currentQuantity + (quantity || 0)}</strong>
              </p>
            </div>
          )}

          {movementType === "exit" && (
            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-300">
                Estoque após saída:{" "}
                <strong>{currentQuantity - (quantity || 0)}</strong>
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                (movementType === "exit" && quantity > currentQuantity)
              }
              className={
                movementType === "entry"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar {movementType === "entry" ? "Entrada" : "Saída"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
