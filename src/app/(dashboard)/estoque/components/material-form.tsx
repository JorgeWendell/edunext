"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import z from "zod";

import { Button } from "@/components/ui/button";
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

const materialFormSchema = z.object({
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

type MaterialFormValues = z.infer<typeof materialFormSchema>;

interface MaterialFormProps {
  defaultValues?: Partial<MaterialFormValues>;
  onSubmit: (values: MaterialFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function MaterialForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: MaterialFormProps) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      description: defaultValues?.description || "",
      category: defaultValues?.category || "",
      quantity: defaultValues?.quantity || 0,
      minQuantity: defaultValues?.minQuantity || 0,
      unit: defaultValues?.unit || "unidade",
      price: defaultValues?.price || "",
      supplier: defaultValues?.supplier || "",
      location: defaultValues?.location || "",
    },
  });

  async function handleSubmit(values: MaterialFormValues) {
    await onSubmit(values);
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Atualize as informações do material"
            : "Preencha os dados para cadastrar um novo material"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Material *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Caneta esferográfica" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Escritório, Limpeza" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Inicial *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      placeholder="0"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minQuantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade Mínima</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      placeholder="0"
                      min={0}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: unidade, kg, litro" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Unitário</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="R$ #,##0.00"
                      allowEmptyFormatting
                      mask="_"
                      value={field.value || ""}
                      onValueChange={(values) => field.onChange(values.value)}
                      customInput={Input}
                      placeholder="R$ 0,00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fornecedor</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do fornecedor" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localização</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Estoque A, Prateleira 3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Descreva o material..."
                    className="min-h-[100px]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEdit ? "Salvar" : "Criar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
