"use client";

import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  createUser,
} from "@/actions/users";
import { UserForm } from "./user-form";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  hasStudentProfile: boolean;
  hasTeacherProfile: boolean;
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error: any) {
        toast.error(error?.message || "Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const result = await updateUserRole({
        id: selectedUser.id,
        role: newRole as "admin" | "student" | "teacher",
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Role atualizado com sucesso!");
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole("");
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar role");
    }
  };

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createUser(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Usuário criado com sucesso!");
      setIsCreateDialogOpen(false);
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar usuário");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteUser({ id: user.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Usuário excluído com sucesso!");
      const data = await getUsers();
      setUsers(data);
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir usuário");
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    const variants: Record<
      string,
      { label: string; icon: any; className: string }
    > = {
      admin: {
        label: "Administrador",
        icon: Shield,
        className:
          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      },
      student: {
        label: "Aluno",
        icon: User,
        className:
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      },
      teacher: {
        label: "Professor",
        icon: UserCheck,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
    };

    const variant = variants[role] || variants.student;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Carregando usuários...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar usuários por nome ou email..."
            className="w-full pl-10 sm:max-w-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <UserForm
              onSubmit={handleCreate}
              onCancel={() => {
                setIsCreateDialogOpen(false);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white dark:bg-gray-900">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                <TableHead className="font-semibold">Usuário</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Role</TableHead>
                <TableHead className="font-semibold">Perfis</TableHead>
                <TableHead className="font-semibold">Verificado</TableHead>
                <TableHead className="font-semibold">Criado em</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <UserX className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum usuário encontrado
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.hasStudentProfile && (
                          <Badge variant="outline" className="text-xs">
                            Aluno
                          </Badge>
                        )}
                        {user.hasTeacherProfile && (
                          <Badge variant="outline" className="text-xs">
                            Professor
                          </Badge>
                        )}
                        {!user.hasStudentProfile && !user.hasTeacherProfile && (
                          <span className="text-muted-foreground text-sm">
                            -
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.emailVerified ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Sim
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                          Não
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(user.createdAt), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openRoleDialog(user)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-purple-600" />
                            Alterar Role
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(user)}
                            className="cursor-pointer text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Role do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Usuário: <strong>{selectedUser.name}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Email: <strong>{selectedUser.email}</strong>
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Novo Role
                </label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="student">Aluno</SelectItem>
                    <SelectItem value="teacher">Professor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsRoleDialogOpen(false);
                    setSelectedUser(null);
                    setNewRole("");
                  }}
                >
                  Cancelar
                </Button>
                <Button onClick={handleUpdateRole}>Salvar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
