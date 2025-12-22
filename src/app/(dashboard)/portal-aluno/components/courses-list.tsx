import { BookOpen, Calendar, Clock, GraduationCap } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStudentEnrollments } from "@/actions/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export async function CoursesList() {
  const enrollments = await getStudentEnrollments();

  if (enrollments.length === 0) {
    return (
      <div className="py-12 text-center">
        <BookOpen className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum curso encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você ainda não está matriculado em nenhum curso
        </p>
      </div>
    );
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {enrollments.map((enrollment) => (
        <Card
          key={enrollment.id}
          className="transition-all hover:shadow-lg dark:bg-gray-900"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge
                className={
                  enrollment.status === "active"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                }
              >
                {enrollment.status === "active" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <CardTitle className="mt-4">{enrollment.course.name}</CardTitle>
            <p className="text-muted-foreground mt-2 text-sm">
              {enrollment.course.description || "Sem descrição"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {enrollment.course.teacher && (
              <div className="flex items-center gap-2 text-sm">
                <GraduationCap className="h-4 w-4 text-gray-500" />
                <span className="text-muted-foreground">
                  {enrollment.course.teacher.user.name}
                </span>
              </div>
            )}
            {enrollment.course.schedule && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-muted-foreground">
                  {enrollment.course.schedule}
                </span>
              </div>
            )}
            {enrollment.course.startDate && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-muted-foreground">
                  Início:{" "}
                  {format(new Date(enrollment.course.startDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Valor do curso:
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {formatPrice(enrollment.course.price)}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Matrícula em:
                </span>
                <span className="text-sm">
                  {format(new Date(enrollment.enrollmentDate), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
