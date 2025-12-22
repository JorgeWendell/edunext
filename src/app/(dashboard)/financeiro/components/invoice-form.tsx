"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PatternFormat } from "react-number-format";
import { useEffect, useState } from "react";
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
import { getStudentsForSelect } from "@/actions/financial";

const invoiceFormSchema = z.object({
  studentId: z.string().min(1, "Aluno é obrigatório"),
  enrollmentId: z.string().optional(),
  amount: z.string().min(1, "Valor é obrigatório"),
  dueDate: z.date(),
  description: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormValues>;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function InvoiceForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: InvoiceFormProps) {
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const studentsData = await getStudentsForSelect();
        setStudents(studentsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    loadData();
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      studentId: defaultValues?.studentId || "",
      enrollmentId: defaultValues?.enrollmentId,
      amount: defaultValues?.amount || "",
      dueDate: defaultValues?.dueDate || new Date(),
      description: defaultValues?.description || "",
    },
  });

  async function handleSubmit(values: InvoiceFormValues) {
    await onSubmit(values);
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          Preencha os dados para gerar uma nova fatura (boleto)
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aluno *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um aluno" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
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
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Vencimento *</FormLabel>
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
                        disabled={(date) => date < new Date()}
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
                    placeholder="Descreva a fatura..."
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
              Gerar Fatura
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
