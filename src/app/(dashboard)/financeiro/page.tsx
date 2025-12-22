import { Wallet } from "lucide-react";
import { Suspense } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  getFinancialTransactions,
  getInvoices,
  getPayments,
} from "@/actions/financial";
import { TransactionsTable } from "./components/transactions-table";
import { InvoicesTable } from "./components/invoices-table";
import { PaymentsTable } from "./components/payments-table";

async function TransactionsList() {
  const transactions = await getFinancialTransactions();
  return <TransactionsTable transactions={transactions} />;
}

async function InvoicesList() {
  const invoices = await getInvoices();
  return <InvoicesTable invoices={invoices} />;
}

async function PaymentsList() {
  const payments = await getPayments();
  return <PaymentsTable payments={payments} />;
}

export default function FinanceiroPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
              <Wallet className="h-7 w-7 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span>Financeiro</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Gerencie as finanças da instituição
          </p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="transactions">Transações</TabsTrigger>
              <TabsTrigger value="invoices">Faturas</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            </TabsList>

            <TabsContent value="transactions">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <TransactionsList />
              </Suspense>
            </TabsContent>

            <TabsContent value="invoices">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <InvoicesList />
              </Suspense>
            </TabsContent>

            <TabsContent value="payments">
              <Suspense
                fallback={
                  <div className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-64 w-full" />
                  </div>
                }
              >
                <PaymentsList />
              </Suspense>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
