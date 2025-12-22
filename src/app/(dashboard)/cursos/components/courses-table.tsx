"use client";

import {
  BookOpen,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState, useEffect } from "react";
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
  createCourse,
  updateCourse,
  deleteCourse,
  getTeachersForSelect,
  getClassroomsForSelect,
} from "@/actions/courses";
import { CourseForm } from "./course-form";

interface Course {
  id: string;
  name: string;
  code: string;
  description: string | null;
  duration: number | null;
  price: string;
  teacherId: string | null;
  classroomId: string | null;
  schedule: string | null;
  startDate: Date | null;
  endDate: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  } | null;
  classroom: {
    id: string;
    name: string;
    capacity: number;
  } | null;
}

interface CoursesTableProps {
  courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [classrooms, setClassrooms] = useState<{ id: string; name: string }[]>(
    [],
  );

  useEffect(() => {
    async function loadData() {
      try {
        const [teachersData, classroomsData] = await Promise.all([
          getTeachersForSelect(),
          getClassroomsForSelect(),
        ]);
        setTeachers(teachersData);
        setClassrooms(classroomsData);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }
    loadData();
  }, []);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createCourse(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Curso criado com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedCourse) return;

    setIsSubmitting(true);
    try {
      const result = await updateCourse({
        ...values,
        id: selectedCourse.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Curso atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar curso");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (course: Course) => {
    if (!confirm(`Tem certeza que deseja excluir o curso ${course.name}?`)) {
      return;
    }

    try {
      const result = await deleteCourse({ id: course.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Curso excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir curso");
    }
  };

  const openEditDialog = (course: Course) => {
    setSelectedCourse(course);
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
      completed: {
        label: "Concluído",
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
    };

    const variant = variants[status] || variants.inactive;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar por nome, código ou professor..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Curso</DialogTitle>
            </DialogHeader>
            <CourseForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
              teachers={teachers}
              classrooms={classrooms}
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
                <TableHead className="font-semibold">Código</TableHead>
                <TableHead className="font-semibold">Professor</TableHead>
                <TableHead className="font-semibold">Sala</TableHead>
                <TableHead className="font-semibold">Preço</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum curso cadastrado
                      </p>
                      <p className="text-sm">
                        Comece adicionando um novo curso
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow
                    key={course.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <span className="text-xs font-semibold">
                            {course.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span>{course.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-purple-600 dark:text-purple-400">
                        {course.code}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.teacher?.user.name || "Não atribuído"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {course.classroom?.name || "Não atribuída"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(course.price)}
                    </TableCell>
                    <TableCell>{getStatusBadge(course.status)}</TableCell>
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
                            onClick={() => openEditDialog(course)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-purple-600" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(course)}
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
        {selectedCourse && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Curso</DialogTitle>
            </DialogHeader>
            <CourseForm
              isEdit
              teachers={teachers}
              classrooms={classrooms}
              defaultValues={{
                name: selectedCourse.name,
                code: selectedCourse.code,
                description: selectedCourse.description || "",
                duration: selectedCourse.duration || undefined,
                price: formatPrice(selectedCourse.price),
                teacherId: selectedCourse.teacherId || "",
                classroomId: selectedCourse.classroomId || "",
                schedule: selectedCourse.schedule || "",
                startDate: selectedCourse.startDate
                  ? new Date(selectedCourse.startDate)
                  : undefined,
                endDate: selectedCourse.endDate
                  ? new Date(selectedCourse.endDate)
                  : undefined,
                status: selectedCourse.status as
                  | "active"
                  | "inactive"
                  | "completed",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedCourse(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
