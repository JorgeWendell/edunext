import { Clock } from "lucide-react";
import { getStudentEnrollments } from "@/actions/student-portal";
import { AttendanceListClient } from "./attendance-list-client";

export async function AttendanceList() {
  const enrollments = await getStudentEnrollments();

  if (enrollments.length === 0) {
    return (
      <div className="py-12 text-center">
        <Clock className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você precisa estar matriculado em um curso para ver suas presenças
        </p>
      </div>
    );
  }

  return <AttendanceListClient enrollments={enrollments} />;
}
