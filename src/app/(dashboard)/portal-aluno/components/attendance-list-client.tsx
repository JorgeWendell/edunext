"use client";

import { CheckCircle, Clock, XCircle } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getStudentAttendance } from "@/actions/student-portal";

interface AttendanceListClientProps {
  enrollments: Awaited<
    ReturnType<typeof import("@/actions/student-portal").getStudentEnrollments>
  >;
}

export function AttendanceListClient({
  enrollments,
}: AttendanceListClientProps) {
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>("");
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleEnrollmentChange = async (enrollmentId: string) => {
    setSelectedEnrollmentId(enrollmentId);
    if (!enrollmentId) {
      setAttendance([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getStudentAttendance(enrollmentId);
      setAttendance(data);
    } catch (error) {
      console.error("Erro ao carregar presenças:", error);
    } finally {
      setLoading(false);
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

  const selectedEnrollment = enrollments.find(
    (e) => e.id === selectedEnrollmentId,
  );

  const presentCount = attendance.filter((a) => a.status === "present").length;
  const absentCount = attendance.filter((a) => a.status === "absent").length;
  const totalCount = attendance.length;
  const attendanceRate =
    totalCount > 0 ? ((presentCount / totalCount) * 100).toFixed(1) : 0;

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
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {presentCount}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Presenças
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {absentCount}
                    </div>
                    <div className="text-muted-foreground text-sm">Faltas</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {attendanceRate}%
                    </div>
                    <div className="text-muted-foreground text-sm">
                      Frequência
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {loading ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">Carregando presenças...</p>
            </div>
          ) : attendance.length === 0 ? (
            <div className="py-12 text-center">
              <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
              <p className="text-muted-foreground mt-4 text-base font-medium">
                Nenhuma presença registrada
              </p>
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Registro de Presenças</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            {format(new Date(record.date), "EEEE, dd/MM/yyyy", {
                              locale: ptBR,
                            })}
                          </div>
                          {record.notes && (
                            <div className="text-muted-foreground mt-1 text-sm">
                              {record.notes}
                            </div>
                          )}
                        </div>
                      </div>
                      {getStatusBadge(record.status)}
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
            Selecione um curso para ver suas presenças
          </p>
        </div>
      )}
    </div>
  );
}
