"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PatternFormat } from "react-number-format";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
} from "@/actions/teacher-portal/schema";

const assignmentFormSchema = z.object({
  courseId: z.string().min(1, "Curso é obrigatório"),
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().optional(),
  type: z.enum(["exam", "assignment", "project", "activity"]),
  dueDate: z.date(),
  maxGrade: z.string().optional(),
});

type AssignmentFormValues = z.infer<typeof assignmentFormSchema>;

interface AssignmentFormProps {
  courseId: string;
  defaultValues?: Partial<AssignmentFormValues>;
  onSubmit: (values: AssignmentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function AssignmentForm({
  courseId,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: AssignmentFormProps) {
  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentFormSchema),
    defaultValues: {
      courseId: courseId || defaultValues?.courseId || "",
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      type: defaultValues?.type || "assignment",
      dueDate: defaultValues?.dueDate || new Date(),
      maxGrade: defaultValues?.maxGrade || "",
    },
  });

  async function handleSubmit(values: AssignmentFormValues) {
    await onSubmit({
      ...values,
      maxGrade: values.maxGrade || undefined,
    });
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Prova de Matemática" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo *</FormLabel>
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
                      <SelectItem value="exam">Prova</SelectItem>
                      <SelectItem value="assignment">Tarefa</SelectItem>
                      <SelectItem value="project">Projeto</SelectItem>
                      <SelectItem value="activity">Atividade</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Entrega *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota Máxima</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="##.##"
                      allowEmptyFormatting
                      mask="_"
                      value={field.value || ""}
                      onValueChange={(values) => field.onChange(values.value)}
                      customInput={Input}
                      placeholder="10.00"
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
                    placeholder="Descreva a tarefa..."
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
