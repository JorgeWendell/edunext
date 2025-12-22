"use client";

import {
  Edit,
  MoreHorizontal,
  Plus,
  School,
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
  createClassroom,
  updateClassroom,
  deleteClassroom,
} from "@/actions/classrooms";
import { ClassroomForm } from "./classroom-form";

interface Classroom {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClassroomsTableProps {
  classrooms: Classroom[];
}

export function ClassroomsTable({ classrooms }: ClassroomsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createClassroom(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Sala criada com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar sala");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedClassroom) return;

    setIsSubmitting(true);
    try {
      const result = await updateClassroom({
        ...values,
        id: selectedClassroom.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Sala atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedClassroom(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar sala");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (classroom: Classroom) => {
    if (!confirm(`Tem certeza que deseja excluir a sala ${classroom.name}?`)) {
      return;
    }

    try {
      const result = await deleteClassroom({ id: classroom.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Sala excluída com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir sala");
    }
  };

  const openEditDialog = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      available: {
        label: "Disponível",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      occupied: {
        label: "Ocupada",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      maintenance: {
        label: "Manutenção",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const variant = variants[status] || variants.available;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou localização..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4" />
              Nova Sala
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Sala</DialogTitle>
            </DialogHeader>
            <ClassroomForm
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
                <TableHead className="font-semibold">Capacidade</TableHead>
                <TableHead className="font-semibold">Localização</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Cadastro</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classrooms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <School className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhuma sala cadastrada
                      </p>
                      <p className="text-sm">
                        Comece adicionando uma nova sala
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                classrooms.map((classroom) => (
                  <TableRow
                    key={classroom.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          <span className="text-xs font-semibold">
                            {classroom.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{classroom.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-orange-600 dark:text-orange-400">
                        {classroom.capacity} lugares
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {classroom.location || "Não informado"}
                    </TableCell>
                    <TableCell>{getStatusBadge(classroom.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(classroom.createdAt), "dd/MM/yyyy", {
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
                            onClick={() => openEditDialog(classroom)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-orange-600" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(classroom)}
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
        {selectedClassroom && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Sala</DialogTitle>
            </DialogHeader>
            <ClassroomForm
              isEdit
              defaultValues={{
                name: selectedClassroom.name,
                capacity: selectedClassroom.capacity,
                location: selectedClassroom.location || "",
                description: selectedClassroom.description || "",
                status: selectedClassroom.status as
                  | "available"
                  | "occupied"
                  | "maintenance",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedClassroom(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
