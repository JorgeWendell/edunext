import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/index";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  BookOpen,
  GraduationCap,
  Package,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, session.user.id))
      .limit(1);

    if (user.length > 0) {
      if (user[0].role === "student") {
        redirect("/portal-aluno");
      } else if (user[0].role === "teacher") {
        redirect("/portal-professor");
      }
    }
  }
  const stats = [
    {
      title: "Total de Alunos",
      value: "0",
      icon: GraduationCap,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total de Professores",
      value: "0",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      title: "Cursos Ativos",
      value: "0",
      icon: BookOpen,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      title: "Receita do Mês",
      value: "R$ 0,00",
      icon: Wallet,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 dark:bg-yellow-950",
    },
    {
      title: "Materiais em Estoque",
      value: "0",
      icon: Package,
      color: "text-gray-600",
      bgColor: "bg-gray-50 dark:bg-gray-950",
    },
    {
      title: "Crescimento",
      value: "+0%",
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema de gestão escolar
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="transition-shadow hover:shadow-lg"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Nenhuma atividade recente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Nenhum evento agendado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
