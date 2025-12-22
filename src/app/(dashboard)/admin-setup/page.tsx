"use client";

import { Shield, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function AdminSetupPage() {
  const [userId, setUserId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getCurrentUser() {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user?.id) {
          setUserId(session.data.user.id);
        }
      } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        toast.error("Erro ao carregar informações do usuário");
      }
    }
    getCurrentUser();
  }, []);

  const handleUpdateToAdmin = async () => {
    if (!userId) {
      toast.error("Usuário não encontrado");
      return;
    }

    if (
      !confirm(
        "Tem certeza que deseja atualizar seu usuário para Administrador? Esta ação não pode ser desfeita facilmente.",
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin-setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao atualizar role");
      }

      toast.success("Role atualizado para Administrador com sucesso!");
      setTimeout(() => {
        router.push("/usuarios");
        router.refresh();
      }, 1500);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Configuração de Administrador</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Atualize seu usuário para ter acesso de administrador
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" />
              <div>
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">
                  Atenção
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  Esta é uma página temporária para configurar o primeiro
                  administrador. Após atualizar seu role, você terá acesso
                  completo ao sistema, incluindo a página de gerenciamento de
                  usuários.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900">
            <p className="text-sm">
              <strong>ID do Usuário:</strong> {userId || "Carregando..."}
            </p>
          </div>

          <Button
            onClick={handleUpdateToAdmin}
            disabled={!userId || loading}
            className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <Shield className="h-4 w-4 animate-spin" />
                Atualizando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Atualizar para Administrador
              </>
            )}
          </Button>

          <p className="text-muted-foreground text-xs">
            Após clicar no botão, você será redirecionado para a página de
            gerenciamento de usuários.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
