"use client";

import {
  CheckCircle,
  Clock,
  XCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  getTeacherCourses,
  getCourseEnrollments,
  getCourseAttendance,
  createAttendance,
  updateAttendance,
} from "@/actions/teacher-portal";

export function AttendanceSheet() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
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
        return;
      }

      setLoading(true);
      try {
        const data = await getCourseEnrollments(selectedCourseId);
        setEnrollments(data);
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        toast.error("Erro ao carregar alunos");
      } finally {
        setLoading(false);
      }
    }
    loadEnrollments();
  }, [selectedCourseId]);

  useEffect(() => {
    async function loadAttendance() {
      if (!selectedCourseId) {
        setAttendance({});
        return;
      }

      try {
        const data = await getCourseAttendance(selectedCourseId, selectedDate);
        const attendanceMap: Record<string, any> = {};
        data.forEach((item) => {
          attendanceMap[item.enrollment.id] = item.attendance;
        });
        setAttendance(attendanceMap);
      } catch (error) {
        console.error("Erro ao carregar presenças:", error);
      }
    }
    loadAttendance();
  }, [selectedCourseId, selectedDate]);

  const handleStatusChange = async (
    enrollmentId: string,
    status: "present" | "absent" | "late" | "excused",
  ) => {
    const existingAttendance = attendance[enrollmentId];

    try {
      if (existingAttendance) {
        const result = await updateAttendance({
          id: existingAttendance.id,
          enrollmentId,
          date: selectedDate,
          status,
        });
        if (result?.serverError) {
          toast.error(result.serverError);
          return;
        }
      } else {
        const result = await createAttendance({
          enrollmentId,
          date: selectedDate,
          status,
        });
        if (result?.serverError) {
          toast.error(result.serverError);
          return;
        }
      }

      setAttendance((prev) => ({
        ...prev,
        [enrollmentId]: {
          ...existingAttendance,
          status,
        },
      }));

      toast.success("Presença atualizada!");
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar presença");
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; icon: any; className: string }
    > = {
      present: {
        label: "Presente",
        icon: CheckCircle,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      absent: {
        label: "Falta",
        icon: XCircle,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
      late: {
        label: "Atrasado",
        icon: Clock,
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      excused: {
        label: "Justificado",
        icon: CheckCircle,
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
    };

    const variant = variants[status] || variants.absent;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  if (courses.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você precisa estar atribuído a um curso para registrar presenças
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, "dd/MM/yyyy", { locale: ptBR })}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedCourseId && (
        <>
          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando alunos...</p>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-base font-medium">
                Nenhum aluno matriculado
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ficha de Presença</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enrollments.map((enrollment) => {
                    const currentAttendance = attendance[enrollment.id];
                    const currentStatus = currentAttendance?.status || null;

                    return (
                      <div
                        key={enrollment.id}
                        className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {enrollment.student.user.name}
                          </div>
                          <div className="text-muted-foreground mt-1 text-sm">
                            Matrícula: {enrollment.student.enrollmentNumber}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {currentStatus && getStatusBadge(currentStatus)}
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant={
                                currentStatus === "present"
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                currentStatus === "present" &&
                                  "bg-green-600 hover:bg-green-700",
                              )}
                              onClick={() =>
                                handleStatusChange(enrollment.id, "present")
                              }
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                currentStatus === "absent"
                                  ? "default"
                                  : "outline"
                              }
                              className={cn(
                                currentStatus === "absent" &&
                                  "bg-red-600 hover:bg-red-700",
                              )}
                              onClick={() =>
                                handleStatusChange(enrollment.id, "absent")
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={
                                currentStatus === "late" ? "default" : "outline"
                              }
                              className={cn(
                                currentStatus === "late" &&
                                  "bg-yellow-600 hover:bg-yellow-700",
                              )}
                              onClick={() =>
                                handleStatusChange(enrollment.id, "late")
                              }
                            >
                              <Clock className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedCourseId && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione um curso para registrar presenças
          </p>
        </div>
      )}
    </div>
  );
}
