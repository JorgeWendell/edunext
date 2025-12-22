"use client";

import {
  Edit,
  FileText,
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
import { createInvoice, updateInvoice } from "@/actions/financial";
import { InvoiceForm } from "./invoice-form";

interface Invoice {
  id: string;
  studentId: string;
  enrollmentId: string | null;
  invoiceNumber: string;
  amount: string;
  dueDate: Date;
  paymentDate: Date | null;
  status: string;
  barcode: string | null;
  pdfUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  student: {
    id: string;
    user: {
      name: string;
    };
  };
}

interface InvoicesTableProps {
  invoices: Invoice[];
}

export function InvoicesTable({ invoices }: InvoicesTableProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (values: any) => {
    setIsSubmitting(true);
    try {
      const result = await createInvoice(values);
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      if (result?.validationErrors) {
        toast.error("Erro de validação. Verifique os campos.");
        return;
      }
      toast.success("Fatura criada com sucesso!");
      setIsCreateDialogOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao criar fatura");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    setIsSubmitting(true);
    try {
      const result = await updateInvoice({
        id: invoice.id,
        status: "paid",
        paymentDate: new Date(),
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("Fatura marcada como paga!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error?.message || "Erro ao atualizar fatura");
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-1 items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            placeholder="Buscar faturas por aluno ou número..."
            className="w-full pl-10 sm:max-w-md"
          />
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-yellow-600 hover:bg-yellow-700">
              <Plus className="h-4 w-4" />
              Nova Fatura
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[95vh] overflow-y-auto sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Nova Fatura</DialogTitle>
            </DialogHeader>
            <InvoiceForm
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
                <TableHead className="font-semibold">Número</TableHead>
                <TableHead className="font-semibold">Aluno</TableHead>
                <TableHead className="font-semibold">Valor</TableHead>
                <TableHead className="font-semibold">Vencimento</TableHead>
                <TableHead className="font-semibold">Pagamento</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Ações
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-muted-foreground py-12 text-center"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-700" />
                      <p className="text-base font-medium">
                        Nenhuma fatura cadastrada
                      </p>
                      <p className="text-sm">Comece gerando uma nova fatura</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell className="font-medium">
                      <span className="font-mono text-yellow-600 dark:text-yellow-400">
                        {invoice.invoiceNumber}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.student.user.name}</TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {format(new Date(invoice.dueDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {invoice.paymentDate
                        ? format(new Date(invoice.paymentDate), "dd/MM/yyyy", {
                            locale: ptBR,
                          })
                        : "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
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
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {invoice.status === "pending" && (
                            <DropdownMenuItem
                              onClick={() => handleMarkAsPaid(invoice)}
                              className="cursor-pointer text-green-600"
                            >
                              Marcar como Pago
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver Boleto
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
    </>
  );
}
