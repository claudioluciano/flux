"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { ReceivableList } from "@/components/financial/receivable-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";
import { TransactionStatus } from "@/convex/lib/financialValidators";

type StatusFilter = "all" | TransactionStatus;

export default function ReceivablesPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contas a Receber"
        description="Gerencie suas contas a receber e recebimentos"
        action={
          <Link href="/receivables/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta a Receber
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
          <TabsTrigger value="paid">Recebidas</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <ReceivableList status={filter === "all" ? undefined : filter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
