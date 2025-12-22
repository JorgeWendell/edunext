import { FileText, Download, CheckCircle, Clock, XCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStudentInvoices } from "@/actions/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export async function InvoicesList() {
  const invoices = await getStudentInvoices();

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numPrice);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      { label: string; icon: any; className: string }
    > = {
      pending: {
        label: "Pendente",
        icon: Clock,
        className:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      },
      paid: {
        label: "Pago",
        icon: CheckCircle,
        className:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      },
      overdue: {
        label: "Vencido",
        icon: XCircle,
        className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      },
    };

    const variant = variants[status] || variants.pending;
    const Icon = variant.icon;

    return (
      <Badge className={variant.className}>
        <Icon className="mr-1 h-3 w-3" />
        {variant.label}
      </Badge>
    );
  };

  if (invoices.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-700" />
        <p className="text-muted-foreground mt-4 text-base font-medium">
          Nenhum boleto encontrado
        </p>
        <p className="text-muted-foreground mt-2 text-sm">
          Você não possui boletos pendentes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Card
          key={invoice.id}
          className="transition-all hover:shadow-lg dark:bg-gray-900"
        >
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                    <FileText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <span className="font-mono text-yellow-600 dark:text-yellow-400">
                    {invoice.invoiceNumber}
                  </span>
                </CardTitle>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-muted-foreground text-sm">Valor</div>
                  <div className="text-xl font-bold">
                    {formatPrice(invoice.amount)}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground text-sm">
                    Vencimento
                  </div>
                  <div className="font-medium">
                    {format(new Date(invoice.dueDate), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </div>
                </div>
                {invoice.paymentDate && (
                  <div>
                    <div className="text-muted-foreground text-sm">
                      Pagamento
                    </div>
                    <div className="font-medium">
                      {format(new Date(invoice.paymentDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                  </div>
                )}
              </div>
              {invoice.status === "pending" && (
                <div className="flex gap-2">
                  <Button className="gap-2 bg-yellow-600 hover:bg-yellow-700">
                    <Download className="h-4 w-4" />
                    Baixar Boleto
                  </Button>
                  {invoice.barcode && (
                    <Button variant="outline" className="gap-2">
                      Ver Código de Barras
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
