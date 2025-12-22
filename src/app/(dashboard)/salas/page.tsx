import { School } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getClassrooms } from "@/actions/classrooms";
import { ClassroomsTable } from "./components/classrooms-table";

async function ClassroomsList() {
  const classrooms = await getClassrooms();

  return <ClassroomsTable classrooms={classrooms} />;
}

export default function SalasPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <School className="h-7 w-7 text-orange-600 dark:text-orange-400" />
            </div>
            <span>Salas</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie as salas da instituição
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
            <ClassroomsList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
