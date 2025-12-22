"use client";

import {
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
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
  createPayment,
  updatePayment,
  deletePayment,
} from "@/actions/financial";
import { PaymentForm } from "./payment-form";

interface Payment {
  id: string;
  teacherId: string;
  amount: string;
  paymentDate: Date;
  referenceMonth: string;
  referenceYear: number;
  description: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  teacher: {
    id: string;
    user: {
      name: string;
    };
  };
}

interface PaymentsTableProps {
  payments: Payment[];
}

const monthNames: Record<string, string> = {
  "01": "Janeiro",
  "02": "Fevereiro",
  "03": "Março",
  "04": "Abril",
  "05": "Maio",
  "06": "Junho",
  "07": "Julho",
  "08": "Agosto",
  "09": "Setembro",
  "10": "Outubro",
  "11": "Novembro",
  "12": "Dezembro",
};

export function PaymentsTable({ payments }: PaymentsTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createPayment(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Pagamento registrado com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao registrar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (values: any) => {
    if (!selectedPayment) return;

    setIsSubmitting(true);
    try {
      const result = await updatePayment({
        ...values,
        id: selectedPayment.id,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Pagamento atualizado com sucesso!");
      setIsEditDialogOpen(false);
      setSelectedPayment(null);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar pagamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (payment: Payment) => {
    if (
      !confirm(
        `Tem certeza que deseja excluir o pagamento de ${payment.teacher.user.name}?`,
      )
    ) {
      return;
    }

    try {
      const result = await deletePayment({ id: payment.id });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação.");
        return;
      }
      toast.success("Pagamento excluído com sucesso!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao excluir pagamento");
    }
  };

  const openEditDialog = (payment: Payment) => {
    setSelectedPayment(payment);
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
    };

    const variant = variants[status] || variants.pending;

    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar pagamentos por professor..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm
              onSubmit={handleCreate}
              onCancel={() => setIsCreateDialogOpen(false)}
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
                <TableHead className="font-semibold">Professor</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Referência</TableHead>
                <TableHead className="font-semibold">
                  Data de Pagamento
                </TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhum pagamento registrado
                      </p>
                      <p className="text-sm">
                        Comece registrando um novo pagamento
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow
                    key={payment.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      {payment.teacher.user.name}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(payment.amount)}
                    </TableCell>
                    <TableCell>
                      {monthNames[payment.referenceMonth] ||
                        payment.referenceMonth}
                      /{payment.referenceYear}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(payment.paymentDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
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
                            onClick={() => openEditDialog(payment)}
                            className="cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4 text-yellow-600" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(payment)}
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

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {selectedPayment && (
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Editar Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm
              isEdit
              defaultValues={{
                teacherId: selectedPayment.teacherId,
                amount: formatPrice(selectedPayment.amount),
                paymentDate: new Date(selectedPayment.paymentDate),
                referenceMonth: selectedPayment.referenceMonth,
                referenceYear: selectedPayment.referenceYear,
                description: selectedPayment.description || "",
              }}
              onSubmit={handleEdit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedPayment(null);
              }}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
