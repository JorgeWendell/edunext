"use client";

import { Calendar, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getTeacherCourses,
  getCourseAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
} from "@/actions/teacher-portal";
import { AssignmentForm } from "./assignment-form";

const assignmentTypeColors: Record<string, string> = {
  exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  assignment: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  project:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  activity: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

const assignmentTypeLabels: Record<string, string> = {
  exam: "Prova",
  assignment: "Tarefa",
  project: "Projeto",
  activity: "Atividade",
};

export function AssignmentsManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getTeacherCourses();
        setCourses(data);
      } catch (error) {
        console.error("Erro ao carregar cursos:", error);
      }
    }
    loadCourses();
  }, []);

  useEffect(() => {
    async function loadAssignments() {
      if (!selectedCourseId) {
        setAssignments([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getCourseAssignments(selectedCourseId);
        setAssignments(data);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        toast.error("Erro ao carregar tarefas");
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, [selectedCourseId]);

  const handleCreate = async (values: any) => {
    try {
      const result = await createAssignment(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Tarefa criada com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar tarefa");
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedAssignment) return;

    try {
      const result = await updateAssignment({
        ...values,
        id: selectedAssignment.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Tarefa atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedAssignment(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar tarefa");
    }
  };

  const handleDelete = async (assignment: any) => {
    if (
      !confirm(`Tem certeza que deseja excluir a tarefa "${assignment.title}"?`)
    ) {
      return;
    }

    try {
      const result = await deleteAssignment({ id: assignment.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("Tarefa excluída com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir tarefa");
    }
  };

  const openEditDialog = (assignment: any) => {
    setSelectedAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você precisa estar atribuído a um curso para gerenciar tarefas
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full sm:max-w-md">
            <SelectValue placeholder="Selecione um curso" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCourseId && (
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Nova Tarefa</DialogTitle>
              </DialogHeader>
              <AssignmentForm
                courseId={selectedCourseId}
                onSubmit={handleCreate}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {selectedCourseId && (
        <>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando tarefas...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="py-12 text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-base font-medium">
                Nenhuma tarefa cadastrada
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Comece criando uma nova tarefa
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignments.map((assignment) => (
                <Card
                  key={assignment.id}
                  className="transition-all hover:shadow-lg dark:bg-gray-900"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-gray-500" />
                          {assignment.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openEditDialog(assignment)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(assignment)}
                            className="cursor-pointer text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Badge
                      className={
                        assignmentTypeColors[assignment.type] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {assignmentTypeLabels[assignment.type] || assignment.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    {assignment.description && (
                      <p className="text-muted-foreground mb-4 text-sm">
                        {assignment.description}
                      </p>
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Data de entrega:
                        </span>
                        <span className="font-medium">
                          {format(new Date(assignment.dueDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                      {assignment.maxGrade && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Nota máxima:
                          </span>
                          <span className="font-medium">
                            {parseFloat(assignment.maxGrade).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {!selectedCourseId && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione um curso para gerenciar tarefas
          </p>
        </div>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedAssignment && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Tarefa</DialogTitle>
            </DialogHeader>
            <AssignmentForm
              isEdit
              courseId={selectedAssignment.courseId}
              defaultValues={{
                title: selectedAssignment.title,
                description: selectedAssignment.description || "",
                type: selectedAssignment.type,
                dueDate: new Date(selectedAssignment.dueDate),
                maxGrade: selectedAssignment.maxGrade
                  ? parseFloat(selectedAssignment.maxGrade).toFixed(2)
                  : "",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedAssignment(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
