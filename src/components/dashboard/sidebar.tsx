"use client";

import {
  BookOpen,
  Calendar,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  School,
  Shield,
  User,
  UserCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  roles?: string[];
}

interface SidebarProps {
  user?: {
    id: string;
    role?: string;
  };
}

const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    color: "text-blue-600",
    roles: ["admin"],
  },
  {
    title: "Alunos",
    href: "/alunos",
    icon: GraduationCap,
    color: "text-blue-500",
    roles: ["admin"],
  },
  {
    title: "Professores",
    href: "/professores",
    icon: Users,
    color: "text-green-500",
    roles: ["admin"],
  },
  {
    title: "Cursos",
    href: "/cursos",
    icon: BookOpen,
    color: "text-purple-500",
    roles: ["admin"],
  },
  {
    title: "Salas",
    href: "/salas",
    icon: School,
    color: "text-orange-500",
    roles: ["admin"],
  },
  {
    title: "Estoque",
    href: "/estoque",
    icon: Package,
    color: "text-gray-600",
    roles: ["admin"],
  },
  {
    title: "Financeiro",
    href: "/financeiro",
    icon: Wallet,
    color: "text-yellow-500",
    roles: ["admin"],
  },
  {
    title: "Usuários",
    href: "/usuarios",
    icon: Shield,
    color: "text-purple-500",
    roles: ["admin"],
  },
  {
    title: "Portal do Aluno",
    href: "/portal-aluno",
    icon: User,
    color: "text-blue-400",
    roles: ["student"],
  },
  {
    title: "Portal do Professor",
    href: "/portal-professor",
    icon: UserCheck,
    color: "text-green-400",
    roles: ["teacher"],
  },
];

export function Sidebar({ user }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = allNavItems.filter((item) => {
    // Se o item não tem roles definidos, não mostrar para ninguém (segurança)
    if (!item.roles) {
      return false;
    }
    // Se o usuário não tem role, não mostrar itens com roles específicos
    if (!user?.role) {
      return false;
    }
    // Admin vê tudo
    if (user.role === "admin") {
      return true;
    }
    // Alunos só veem o Portal do Aluno (roles: ["student"])
    if (user.role === "student") {
      return item.roles.includes("student");
    }
    // Professores veem seus itens específicos
    if (user.role === "teacher") {
      return item.roles.includes("teacher");
    }
    // Outros roles só veem seus itens específicos
    return item.roles.includes(user.role);
  });

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
    <>
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-16 shrink-0 items-center gap-2">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-lg"
              unoptimized
            />
            <span className="text-xl font-bold">EduNext</span>
          </div>
          <nav className="flex flex-1 flex-col">
            <ScrollArea className="flex-1">
              <ul role="list" className="flex flex-1 flex-col gap-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            isActive ? item.color : "text-gray-400",
                          )}
                        />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
            <Separator className="my-4" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-x-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
            >
              <LogOut className="h-6 w-6 shrink-0" />
              Sair
            </Button>
          </nav>
        </div>
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden dark:bg-gray-900">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(true)}
          className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <div className="flex-1 text-sm leading-6 font-semibold text-gray-900 dark:text-gray-100">
          EduNext
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-gray-900/80"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-white px-6 pb-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 dark:bg-gray-900">
            <div className="flex h-16 items-center justify-between gap-x-6">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  className="rounded-lg"
                  unoptimized
                />
                <span className="text-lg font-bold">EduNext</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="-m-2.5 p-2.5 text-gray-700 dark:text-gray-300"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="mt-6">
              <ul role="list" className="flex flex-col gap-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.title}>
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex gap-x-3 rounded-lg p-3 text-sm leading-6 font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                          isActive
                            ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
                            : "text-gray-700 dark:text-gray-300",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-6 w-6 shrink-0",
                            isActive ? item.color : "text-gray-400",
                          )}
                        />
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Separator className="my-4" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start gap-x-3 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400"
              >
                <LogOut className="h-6 w-6 shrink-0" />
                Sair
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
