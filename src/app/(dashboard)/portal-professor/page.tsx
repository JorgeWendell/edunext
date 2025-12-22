import {
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  User,
} from "lucide-react";
import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CoursesList } from "./components/courses-list";
import { AttendanceSheet } from "./components/attendance-sheet";
import { GradesManagement } from "./components/grades-management";
import { AssignmentsManagement } from "./components/assignments-management";
import { LogoutButton } from "./components/logout-button";

async function TeacherInfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <User className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{session?.user?.name}</h1>
          <p className="text-muted-foreground text-sm">
            {session?.user?.email}
          </p>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}

export default async function PortalProfessorPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <TeacherInfo />
      </Suspense>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-4">
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <ClipboardList className="h-4 w-4" />
                Presença
              </TabsTrigger>
              <TabsTrigger value="grades" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Notas
              </TabsTrigger>
              <TabsTrigger value="assignments" className="gap-2">
                <Calendar className="h-4 w-4" />
                Tarefas
              </TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
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
            </TabsContent>

            <TabsContent value="attendance">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <AttendanceSheet />
              </Suspense>
            </TabsContent>

            <TabsContent value="grades">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <GradesManagement />
              </Suspense>
            </TabsContent>

            <TabsContent value="assignments">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <AssignmentsManagement />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
