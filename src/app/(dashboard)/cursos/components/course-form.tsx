"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PatternFormat, NumericFormat } from "react-number-format";
import z from "zod";
import { useEffect } from "react";

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

const courseFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  code: z.string().min(1, "Código é obrigatório"),
  description: z.string().optional(),
  duration: z.number().int().positive().optional().or(z.literal("")),
  price: z.string().min(1, "Preço é obrigatório"),
  teacherId: z.string().optional(),
  classroomId: z.string().optional(),
  schedule: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  status: z.enum(["active", "inactive", "completed"]).default("active"),
});

// Função para gerar código do curso
function generateCourseCode(name: string): string {
  // Remove acentos e caracteres especiais, converte para maiúsculas
  const normalizedName = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase();

  // Pega as 3 primeiras letras
  const firstThree = normalizedName.substring(0, 3).padEnd(3, "X");

  // Gera 2 dígitos aleatórios
  const randomDigits = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");

  // Pega os 2 últimos dígitos do ano atual
  const year = new Date().getFullYear().toString().slice(-2);

  return `${firstThree}-${randomDigits}${year}`;
}

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues>;
  onSubmit: (values: CourseFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
  teachers?: { id: string; name: string }[];
  classrooms?: { id: string; name: string }[];
}

export function CourseForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
  teachers = [],
  classrooms = [],
}: CourseFormProps) {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      code: defaultValues?.code || "",
      description: defaultValues?.description || "",
      duration: defaultValues?.duration || undefined,
      price: defaultValues?.price || "",
      teacherId: defaultValues?.teacherId,
      classroomId: defaultValues?.classroomId,
      schedule: defaultValues?.schedule || "",
      startDate: defaultValues?.startDate,
      endDate: defaultValues?.endDate,
      status: defaultValues?.status || "active",
    },
  });

  // Gerar código automaticamente quando o nome mudar (apenas em criação)
  const courseName = form.watch("name");
  useEffect(() => {
    if (!isEdit && courseName && courseName.length >= 3) {
      const generatedCode = generateCourseCode(courseName);
      form.setValue("code", generatedCode);
    }
  }, [courseName, isEdit, form]);

  async function handleSubmit(values: CourseFormValues) {
    const submitValues = {
      ...values,
      duration: values.duration === "" ? undefined : Number(values.duration),
      teacherId: values.teacherId || undefined,
      classroomId: values.classroomId || undefined,
    };
    await onSubmit(submitValues);
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Atualize as informações do curso"
            : "Preencha os dados para cadastrar um novo curso"}
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
                  <FormLabel>Nome do Curso *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ex: Matemática Básica" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código do Curso *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: PRO-8525"
                      disabled={true}
                      className="bg-muted cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-muted-foreground text-xs">
                    {isEdit
                      ? "Código não pode ser alterado"
                      : "Código gerado automaticamente"}
                  </p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => {
                // Converte o valor do campo para número (se estiver em formato string com vírgula)
                const numericValue = field.value
                  ? parseFloat(
                      field.value.replace(/[R$\s.]/g, "").replace(",", "."),
                    )
                  : undefined;

                return (
                  <FormItem>
                    <FormLabel>Preço *</FormLabel>
                    <FormControl>
                      <NumericFormat
                        thousandSeparator="."
                        decimalSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        prefix="R$ "
                        allowNegative={false}
                        value={numericValue}
                        onValueChange={(values) => {
                          // Salva o valor formatado: XXX,XX (sem pontos de milhar no valor salvo)
                          if (values.floatValue !== undefined) {
                            const formatted = values.floatValue
                              .toFixed(2)
                              .replace(".", ",");
                            field.onChange(formatted);
                          } else {
                            field.onChange("");
                          }
                        }}
                        customInput={Input}
                        placeholder="R$ 0,00"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (horas)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      value={field.value || undefined}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                      placeholder="Ex: 40"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="teacherId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professor</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    {...(field.value && { value: field.value })}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um professor (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name}
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
              name="classroomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sala</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    {...(field.value && { value: field.value })}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma sala (opcional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {classrooms.map((classroom) => (
                        <SelectItem key={classroom.id} value={classroom.id}>
                          {classroom.name}
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
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ex: Segunda e Quarta, 14h-16h"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Início</FormLabel>
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
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Término</FormLabel>
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
                    placeholder="Descreva o curso..."
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
