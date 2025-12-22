"use client";

import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
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
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/actions/teachers";
import { TeacherForm } from "./teacher-form";

interface Teacher {
  id: string;
  userId: string;
  cpf: string;
  phone: string | null;
  birthDate: Date | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  specialization: string | null;
  hireDate: Date;
  salary: string | null;
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

interface TeachersTableProps {
  teachers: Teacher[];
}

export function TeachersTable({ teachers }: TeachersTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createTeacher(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Professor criado com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar professor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedTeacher) return;

    setIsSubmitting(true);
    try {
      const result = await updateTeacher({
        ...values,
        id: selectedTeacher.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Professor atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedTeacher(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar professor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (teacher: Teacher) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o professor ${teacher.user.name}?`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteTeacher({ id: teacher.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Professor excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir professor");
    }
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
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
            placeholder="Buscar por nome, e-mail, CPF ou especialização..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Professor</DialogTitle>
            </DialogHeader>
            <TeacherForm
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
                <TableHead className="font-semibold">Especialização</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Contratação</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum professor cadastrado
                      </p>
                      <p className="text-sm">
                        Comece adicionando um novo professor
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                teachers.map((teacher) => (
                  <TableRow
                    key={teacher.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <span className="text-xs font-semibold">
                            {teacher.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{teacher.user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {teacher.user.email}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {teacher.cpf}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-green-600 dark:text-green-400">
                        {teacher.specialization || "Não informado"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(teacher.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(teacher.hireDate), "dd/MM/yyyy", {
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
                            onClick={() => openEditDialog(teacher)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-green-600" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(teacher)}
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
        {selectedTeacher && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Professor</DialogTitle>
            </DialogHeader>
            <TeacherForm
              isEdit
              defaultValues={{
                name: selectedTeacher.user.name,
                email: selectedTeacher.user.email,
                cpf: selectedTeacher.cpf,
                phone: selectedTeacher.phone || "",
                birthDate: selectedTeacher.birthDate
                  ? new Date(selectedTeacher.birthDate)
                  : undefined,
                address: selectedTeacher.address || "",
                city: selectedTeacher.city || "",
                state: selectedTeacher.state || "",
                zipCode: selectedTeacher.zipCode || "",
                specialization: selectedTeacher.specialization || "",
                hireDate: new Date(selectedTeacher.hireDate),
                salary: selectedTeacher.salary || "",
                status: selectedTeacher.status as
                  | "active"
                  | "inactive"
                  | "suspended",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTeacher(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
