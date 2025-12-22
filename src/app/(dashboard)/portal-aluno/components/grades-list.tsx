"use client";

import { GraduationCap, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getStudentEnrollments,
  getStudentGrades,
} from "@/actions/student-portal";

export function GradesList() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [grades, setGrades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEnrollments() {
      try {
        const data = await getStudentEnrollments();
        setEnrollments(data);
      } catch (error) {
        console.error("Erro ao carregar matrículas:", error);
      }
    }
    loadEnrollments();
  }, []);

  const handleEnrollmentChange = async (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    if (!enrollmentId) {
      setGrades([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getStudentGrades(enrollmentId);
      setGrades(data);
    } catch (error) {
      console.error("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverage = () => {
    if (grades.length === 0) return 0;
    const sum = grades.reduce((acc, grade) => acc + parseFloat(grade.grade), 0);
    return (sum / grades.length).toFixed(2);
  };

  const selectedEnrollment = enrollments.find(
    (e) => e.id === selectedEnrollmentId,
  );

  if (enrollments.length === 0) {
    return (
      <div className="py-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você precisa estar matriculado em um curso para ver suas notas
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Select
          value={selectedEnrollmentId}
          onValueChange={handleEnrollmentChange}
        >
          <SelectTrigger className="w-full sm:max-w-md">
            <SelectValue placeholder="Selecione um curso" />
          </SelectTrigger>
          <SelectContent>
            {enrollments.map((enrollment) => (
              <SelectItem key={enrollment.id} value={enrollment.id}>
                {enrollment.course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedEnrollmentId && (
        <>
          {selectedEnrollment && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedEnrollment.course.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Média Geral
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {loading ? "..." : calculateAverage()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando notas...</p>
            </div>
          ) : grades.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-base font-medium">
                Nenhuma nota registrada
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Boletim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {grades.map((grade) => (
                    <div
                      key={grade.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex-1">
                        <div className="font-medium">
                          {grade.assignment?.title ||
                            grade.description ||
                            "Nota"}
                        </div>
                        {grade.type && (
                          <div className="text-muted-foreground mt-1 text-sm">
                            Tipo: {grade.type}
                          </div>
                        )}
                        {grade.assignment && (
                          <div className="text-muted-foreground mt-1 text-sm">
                            {grade.assignment.description}
                          </div>
                        )}
                      </div>
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold">
                          {parseFloat(grade.grade).toFixed(2)}
                        </div>
                        {grade.assignment?.maxGrade && (
                          <div className="text-muted-foreground text-sm">
                            / {parseFloat(grade.assignment.maxGrade).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!selectedEnrollmentId && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Selecione um curso para ver suas notas
          </p>
        </div>
      )}
    </div>
  );
}
