"use client";

import {
  Edit,
  GraduationCap,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createStudent,
  updateStudent,
  deleteStudent,
} from "@/actions/students";
import { StudentForm } from "./student-form";

interface Student {
  id: string;
  userId: string;
  cpf: string;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  enrollmentNumber: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

interface StudentsTableProps {
  students: Student[];
}

export function StudentsTable({ students }: StudentsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createStudent(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Aluno criado com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar aluno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedStudent) return;

    setIsSubmitting(true);
    try {
      const result = await updateStudent({
        ...values,
        id: selectedStudent.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Aluno atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar aluno");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (student: Student) => {
    if (
      !confirm(`Tem certeza que deseja excluir o aluno ${student.user.name}?`)
    ) {
      return;
    }

    try {
      const result = await deleteStudent({ id: student.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Aluno excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir aluno");
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: {
        label: "Ativo",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      inactive: {
        label: "Inativo",
        className:
          "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      },
      suspended: {
        label: "Suspenso",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const variant = variants[status] || variants.inactive;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, e-mail, CPF ou matrícula..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Aluno</DialogTitle>
            </DialogHeader>
            <StudentForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">E-mail</TableHead>
                <TableHead className="font-semibold">CPF</TableHead>
                <TableHead className="font-semibold">Matrícula</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Cadastro</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <GraduationCap className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum aluno cadastrado
                      </p>
                      <p className="text-sm">
                        Comece adicionando um novo aluno
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow
                    key={student.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <span className="text-xs font-semibold">
                            {student.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{student.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {student.user.email}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {student.cpf}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {student.enrollmentNumber}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(student.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(student.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEditDialog(student)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(student)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedStudent && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Aluno</DialogTitle>
            </DialogHeader>
            <StudentForm
              isEdit
              defaultValues={{
                name: selectedStudent.user.name,
                email: selectedStudent.user.email,
                cpf: selectedStudent.cpf,
                phone: selectedStudent.phone || "",
                birthDate: selectedStudent.birthDate
                  ? new Date(selectedStudent.birthDate)
                  : undefined,
                address: selectedStudent.address || "",
                city: selectedStudent.city || "",
                state: selectedStudent.state || "",
                zipCode: selectedStudent.zipCode || "",
                parentName: selectedStudent.parentName || "",
                parentPhone: selectedStudent.parentPhone || "",
                parentEmail: selectedStudent.parentEmail || "",
                enrollmentNumber: selectedStudent.enrollmentNumber,
                status: selectedStudent.status as
                  | "active"
                  | "inactive"
                  | "suspended",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedStudent(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
