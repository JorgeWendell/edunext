import { BookOpen } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { getCourses } from "@/actions/courses";
import { CoursesTable } from "./components/courses-table";

async function CoursesList() {
  const courses = await getCourses();

  return <CoursesTable courses={courses} />;
}

export default function CursosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <BookOpen className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Cursos</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie os cursos da instituição
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
            <CoursesList />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
