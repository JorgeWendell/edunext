import { Users } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getTeachers } from "@/actions/teachers";
import { TeachersTable } from "./components/teachers-table";

async function TeachersList() {
  const teachers = await getTeachers();

  return <TeachersTable teachers={teachers} />;
}

export default function ProfessoresPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
              <Users className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <span>Professores</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie os professores da instituição
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
            <TeachersList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
