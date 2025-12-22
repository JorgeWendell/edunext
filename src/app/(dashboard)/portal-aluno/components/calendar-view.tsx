"use client";

import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAllStudentAssignments } from "@/actions/student-portal";

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

export function CalendarView() {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const data = await getAllStudentAssignments();
        setAssignments(data);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter((assignment) => {
      const dueDate = new Date(assignment.dueDate);
      return (
        dueDate.getDate() === date.getDate() &&
        dueDate.getMonth() === date.getMonth() &&
        dueDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getDateModifiers = (date: Date) => {
    const assignmentsForDate = getAssignmentsForDate(date);
    return {
      hasAssignments: assignmentsForDate.length > 0,
    };
  };

  const selectedDateAssignments = selectedDate
    ? getAssignmentsForDate(selectedDate)
    : [];

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Carregando calendário...</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Calendário
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ptBR}
            className="rounded-md border"
            modifiers={getDateModifiers}
            modifiersClassNames={{
              hasAssignments: "bg-blue-100 dark:bg-blue-900/30 font-bold",
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedDate
              ? format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR,
                })
              : "Selecione uma data"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDateAssignments.length === 0 ? (
            <div className="py-8 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhuma tarefa agendada para esta data
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedDateAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-gray-500" />
                        <h3 className="font-semibold">{assignment.title}</h3>
                      </div>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {assignment.course?.name}
                      </p>
                      {assignment.description && (
                        <p className="text-muted-foreground mt-2 text-sm">
                          {assignment.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <GraduationCap className="h-3 w-3" />
                          {assignment.teacher?.user?.name}
                        </div>
                        {assignment.maxGrade && (
                          <div className="text-muted-foreground text-sm">
                            Nota máxima:{" "}
                            {parseFloat(assignment.maxGrade).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        assignmentTypeColors[assignment.type] ||
                          "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
                      )}
                    >
                      {assignmentTypeLabels[assignment.type] || assignment.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
