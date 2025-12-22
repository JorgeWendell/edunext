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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createGradeSchema,
  updateGradeSchema,
} from "@/actions/teacher-portal/schema";

const gradeFormSchema = z.object({
  enrollmentId: z.string().min(1, "Aluno é obrigatório"),
  assignmentId: z.string().optional(),
  grade: z.string().min(1, "Nota é obrigatória"),
  type: z.string().min(1, "Tipo é obrigatório"),
  description: z.string().optional(),
});

type GradeFormValues = z.infer<typeof gradeFormSchema>;

interface GradeFormProps {
  enrollmentId: string;
  enrollments: any[];
  defaultValues?: Partial<GradeFormValues>;
  onSubmit: (values: GradeFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function GradeForm({
  enrollmentId,
  enrollments,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: GradeFormProps) {
  const form = useForm<GradeFormValues>({
    resolver: zodResolver(gradeFormSchema),
    defaultValues: {
      enrollmentId: enrollmentId || defaultValues?.enrollmentId || "",
      assignmentId: defaultValues?.assignmentId || "",
      grade: defaultValues?.grade || "",
      type: defaultValues?.type || "exam",
      description: defaultValues?.description || "",
    },
  });

  async function handleSubmit(values: GradeFormValues) {
    await onSubmit({
      ...values,
      assignmentId: values.assignmentId || undefined,
    });
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="enrollmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {enrollments.map((enrollment) => (
                        <SelectItem key={enrollment.id} value={enrollment.id}>
                          {enrollment.student.user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="participation">
                        Participação
                      </SelectItem>
                      <SelectItem value="homework">Trabalho</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nota *</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="##.##"
                      allowEmptyFormatting
                      mask="_"
                      value={field.value || ""}
                      onValueChange={(values) => field.onChange(values.value)}
                      customInput={Input}
                      placeholder="0.00"
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
                    placeholder="Descreva a nota..."
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
