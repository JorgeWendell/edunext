"use client";

import {
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  getCourseEnrollments,
  getCourseGrades,
  createGrade,
  updateGrade,
  deleteGrade,
} from "@/actions/teacher-portal";
import { GradeForm } from "./grade-form";

export function GradesManagement() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState<any | null>(null);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
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
    async function loadEnrollments() {
      if (!selectedCourseId) {
        setEnrollments([]);
        setGrades([]);
        return;
      }

      setLoading(true);
      try {
        const [enrollmentsData, gradesData] = await Promise.all([
          getCourseEnrollments(selectedCourseId),
          getCourseGrades(selectedCourseId),
        ]);
        setEnrollments(enrollmentsData);
        setGrades(gradesData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, [selectedCourseId]);

  const handleCreate = async (values: any) => {
    try {
      const result = await createGrade(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Nota criada com sucesso!");
      setIsCreateDialogOpen(false);
      setSelectedEnrollmentId("");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar nota");
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedGrade) return;

    try {
      const result = await updateGrade({
        ...values,
        id: selectedGrade.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Nota atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedGrade(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar nota");
    }
  };

  const handleDelete = async (grade: any) => {
    if (!confirm(`Tem certeza que deseja excluir esta nota?`)) {
      return;
    }

    try {
      const result = await deleteGrade({ id: grade.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("Nota excluída com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir nota");
    }
  };

  const openCreateDialog = (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (grade: any) => {
    setSelectedGrade(grade);
    setIsEditDialogOpen(true);
  };

  const getGradesByEnrollment = (enrollmentId: string) => {
    return grades.filter((g) => g.enrollment.id === enrollmentId);
  };

  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você precisa estar atribuído a um curso para gerenciar notas
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
      </div>

      {selectedCourseId && (
        <>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-base font-medium">
                Nenhum aluno matriculado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => {
                const enrollmentGrades = getGradesByEnrollment(enrollment.id);
                const average =
                  enrollmentGrades.length > 0
                    ? (
                        enrollmentGrades.reduce(
                          (sum, g) => sum + parseFloat(g.grade),
                          0,
                        ) / enrollmentGrades.length
                      ).toFixed(2)
                    : "0.00";

                return (
                  <Card key={enrollment.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>{enrollment.student.user.name}</CardTitle>
                          <p className="text-muted-foreground mt-1 text-sm">
                            Matrícula: {enrollment.student.enrollmentNumber}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground text-sm">
                            Média
                          </div>
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {average}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {enrollmentGrades.length === 0 ? (
                          <p className="text-muted-foreground py-4 text-center text-sm">
                            Nenhuma nota registrada
                          </p>
                        ) : (
                          enrollmentGrades.map((grade) => (
                            <div
                              key={grade.id}
                              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                            >
                              <div className="flex-1">
                                <div className="font-medium">
                                  {grade.assignment?.title ||
                                    grade.description ||
                                    "Nota"}
                                </div>
                                <div className="text-muted-foreground mt-1 text-sm">
                                  Tipo: {grade.type}
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-xl font-bold">
                                    {parseFloat(grade.grade).toFixed(2)}
                                  </div>
                                  {grade.assignment?.maxGrade && (
                                    <div className="text-muted-foreground text-xs">
                                      /{" "}
                                      {parseFloat(
                                        grade.assignment.maxGrade,
                                      ).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => openEditDialog(grade)}
                                      className="cursor-pointer"
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Editar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleDelete(grade)}
                                      className="cursor-pointer text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))
                        )}
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => openCreateDialog(enrollment.id)}
                        >
                          <Plus className="h-4 w-4" />
                          Adicionar Nota
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {!selectedCourseId && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione um curso para gerenciar notas
          </p>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Nota</DialogTitle>
          </DialogHeader>
          <GradeForm
            enrollmentId={selectedEnrollmentId}
            enrollments={enrollments}
            onSubmit={handleCreate}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setSelectedEnrollmentId("");
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedGrade && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Nota</DialogTitle>
            </DialogHeader>
            <GradeForm
              isEdit
              enrollmentId={selectedGrade.enrollment.id}
              enrollments={enrollments}
              defaultValues={{
                grade: parseFloat(selectedGrade.grade).toFixed(2),
                type: selectedGrade.type,
                description: selectedGrade.description || "",
                assignmentId: selectedGrade.assignmentId || "",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedGrade(null);
              }}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
