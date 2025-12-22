"use client";

import {
  ArrowDown,
  ArrowUp,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createFinancialTransaction,
  updateFinancialTransaction,
  deleteFinancialTransaction,
} from "@/actions/financial";
import { TransactionForm } from "./transaction-form";

interface Transaction {
  id: string;
  type: string;
  category: string;
  description: string;
  amount: string;
  dueDate: Date;
  paymentDate: Date | null;
  status: string;
  studentId: string | null;
  teacherId: string | null;
  courseId: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    user: {
      name: string;
    };
  } | null;
  teacher: {
    id: string;
    user: {
      name: string;
    };
  } | null;
  course: {
    id: string;
    name: string;
  } | null;
}

interface TransactionsTableProps {
  transactions: Transaction[];
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createFinancialTransaction(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Transação criada com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedTransaction) return;

    setIsSubmitting(true);
    try {
      const result = await updateFinancialTransaction({
        ...values,
        id: selectedTransaction.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Transação atualizada com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedTransaction(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar transação");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (transaction: Transaction) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir a transação ${transaction.description}?`,
      )
    ) {
      return;
    }

    try {
      const result = await deleteFinancialTransaction({ id: transaction.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Transação excluída com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir transação");
    }
  };

  const openEditDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendente",
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      paid: {
        label: "Pago",
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      overdue: {
        label: "Vencido",
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const variant = variants[status] || variants.pending;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const incomeTransactions = transactions.filter((t) => t.type === "income");
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar transações..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="rounded-lg border bg-white dark:bg-gray-900">
          <div className="border-b p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ArrowUp className="h-5 w-5 text-green-600" />
              Receitas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Nenhuma receita cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  incomeTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.category}
                      </TableCell>
                      <TableCell className="font-medium text-green-600 dark:text-green-400">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(transaction.dueDate), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
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
                              onClick={() => openEditDialog(transaction)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(transaction)}
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

        <div className="rounded-lg border bg-white dark:bg-gray-900">
          <div className="border-b p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ArrowDown className="h-5 w-5 text-red-600" />
              Despesas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="font-semibold">Descrição</TableHead>
                  <TableHead className="font-semibold">Categoria</TableHead>
                  <TableHead className="font-semibold">Valor</TableHead>
                  <TableHead className="font-semibold">Vencimento</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground py-8 text-center"
                    >
                      Nenhuma despesa cadastrada
                    </TableCell>
                  </TableRow>
                ) : (
                  expenseTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <TableCell className="font-medium">
                        {transaction.description}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {transaction.category}
                      </TableCell>
                      <TableCell className="font-medium text-red-600 dark:text-red-400">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(transaction.dueDate), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
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
                              onClick={() => openEditDialog(transaction)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(transaction)}
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
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedTransaction && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Transação</DialogTitle>
            </DialogHeader>
            <TransactionForm
              isEdit
              defaultValues={{
                type: selectedTransaction.type as "income" | "expense",
                category: selectedTransaction.category,
                description: selectedTransaction.description,
                amount: formatPrice(selectedTransaction.amount),
                dueDate: new Date(selectedTransaction.dueDate),
                paymentDate: selectedTransaction.paymentDate
                  ? new Date(selectedTransaction.paymentDate)
                  : undefined,
                status: selectedTransaction.status as
                  | "pending"
                  | "paid"
                  | "overdue",
                studentId: selectedTransaction.studentId || undefined,
                teacherId: selectedTransaction.teacherId || undefined,
                courseId: selectedTransaction.courseId || undefined,
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedTransaction(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
