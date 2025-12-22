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

const studentFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .optional()
    .or(z.literal("")),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().optional(),
  birthDate: z.date().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  parentName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentEmail: z
    .string()
    .email("E-mail do responsável inválido")
    .optional()
    .or(z.literal("")),
  enrollmentNumber: z.string().min(1, "Número de matrícula é obrigatório"),
  status: z.enum(["active", "inactive", "suspended"]).default("active"),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>;
  onSubmit: (values: StudentFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  isEdit?: boolean;
}

export function StudentForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  isEdit = false,
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      password: "",
      cpf: defaultValues?.cpf || "",
      phone: defaultValues?.phone || "",
      birthDate: defaultValues?.birthDate,
      address: defaultValues?.address || "",
      city: defaultValues?.city || "",
      state: defaultValues?.state || "",
      zipCode: defaultValues?.zipCode || "",
      parentName: defaultValues?.parentName || "",
      parentPhone: defaultValues?.parentPhone || "",
      parentEmail: defaultValues?.parentEmail || "",
      enrollmentNumber: defaultValues?.enrollmentNumber || "",
      status: defaultValues?.status || "active",
    },
  });

  async function handleSubmit(values: StudentFormValues) {
    const submitValues = { ...values };
    if (
      isEdit &&
      (!submitValues.password || submitValues.password.trim() === "")
    ) {
      delete submitValues.password;
    }
    await onSubmit(submitValues);
  }

  return (
    <div className="max-h-[90vh] overflow-y-auto">
      <div className="mb-4">
        <p className="text-muted-foreground text-sm">
          {isEdit
            ? "Atualize as informações do aluno"
            : "Preencha os dados para cadastrar um novo aluno"}
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
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="João Silva" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      placeholder="joao@email.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isEdit && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha *</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        {...field}
                        placeholder="Mínimo 8 caracteres"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF *</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="###.###.###-##"
                      mask="_"
                      value={field.value}
                      onValueChange={(values) => field.onChange(values.value)}
                      customInput={Input}
                      placeholder="000.000.000-00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <PatternFormat
                      format="(##) #####-####"
                      mask="_"
                      value={field.value || ""}
                      onValueChange={(values) => field.onChange(values.value)}
                      customInput={Input}
                      placeholder="(00) 00000-0000"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de Nascimento</FormLabel>
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
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
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
              name="enrollmentNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Matrícula *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="2024001" />
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
                      <SelectItem value="suspended">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Endereço</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Rua, número, complemento"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Cidade" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="UF" maxLength={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="#####-###"
                        mask="_"
                        value={field.value || ""}
                        onValueChange={(values) => field.onChange(values.value)}
                        customInput={Input}
                        placeholder="00000-000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Responsável</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="parentName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Responsável</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone do Responsável</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="(##) #####-####"
                        mask="_"
                        value={field.value || ""}
                        onValueChange={(values) => field.onChange(values.value)}
                        customInput={Input}
                        placeholder="(00) 00000-0000"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="parentEmail"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>E-mail do Responsável</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="email@responsavel.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

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
