"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { PayableList } from "@/components/financial/payable-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { TransactionStatus } from "@/convex/lib/financialValidators";

type StatusFilter = "all" | TransactionStatus;

export default function PayablesPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a Pagar"
        description="Gerencie suas contas a pagar e pagamentos"
        action={
          <Link href="/payables/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta a Pagar
            </Button>
          </Link>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendentes</TabsTrigger>
          <TabsTrigger value="overdue">Vencidas</TabsTrigger>
          <TabsTrigger value="partial">Parciais</TabsTrigger>
          <TabsTrigger value="paid">Pagas</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <PayableList status={filter === "all" ? undefined : filter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
