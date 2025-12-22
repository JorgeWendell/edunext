import { GraduationCap } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getStudents } from "@/actions/students";
import { StudentsTable } from "./components/students-table";

async function StudentsList() {
  const students = await getStudents();

  return <StudentsTable students={students} />;
}

export default function AlunosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
              <GraduationCap className="h-7 w-7 text-blue-600 dark:text-blue-400" />
            </div>
            <span>Alunos</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie os alunos da instituição
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Suspense
            fallback={
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            }
          >
            <StudentsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
