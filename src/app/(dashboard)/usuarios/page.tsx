import { Shield } from "lucide-react";
import { Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { UsersTable } from "./components/users-table";

export default function UsuariosPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Shield className="h-7 w-7 text-purple-600 dark:text-purple-400" />
            </div>
            <span>Gerenciar Usuários</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie os usuários e permissões do sistema
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
            <UsersTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
