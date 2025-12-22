"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function LogoutButton() {
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/authentication";
        },
      },
    });
  };

  return (
    <Button
      variant="outline"
      onClick={handleLogout}
      className="gap-2 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
    >
      <LogOut className="h-4 w-4" />
      Sair
    </Button>
  );
}
