import {
  BookOpen,
  Calendar,
  FileText,
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
import { AttendanceList } from "./components/attendance-list";
import { GradesList } from "./components/grades-list";
import { InvoicesList } from "./components/invoices-list";
import { CalendarView } from "./components/calendar-view";
import { LogoutButton } from "./components/logout-button";

async function StudentInfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
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

export default async function PortalAlunoPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-20 w-full" />}>
        <StudentInfo />
      </Suspense>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="mb-6 grid w-full grid-cols-5">
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Cursos
              </TabsTrigger>
              <TabsTrigger value="attendance" className="gap-2">
                <User className="h-4 w-4" />
                Presença
              </TabsTrigger>
              <TabsTrigger value="grades" className="gap-2">
                <GraduationCap className="h-4 w-4" />
                Boletim
              </TabsTrigger>
              <TabsTrigger value="invoices" className="gap-2">
                <FileText className="h-4 w-4" />
                Boletos
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <Calendar className="h-4 w-4" />
                Calendário
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
                <AttendanceList />
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
                <GradesList />
              </Suspense>
            </TabsContent>

            <TabsContent value="invoices">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <InvoicesList />
              </Suspense>
            </TabsContent>

            <TabsContent value="calendar">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <CalendarView />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
