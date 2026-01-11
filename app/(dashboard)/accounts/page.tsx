"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { AccountList } from "@/components/financial/account-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

type AccountFilter = "all" | "revenue" | "expense" | "cost";

export default function AccountsPage() {
  const [filter, setFilter] = useState<AccountFilter>("all");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plano de Contas"
        description="Gerencie suas categorias de receitas e despesas"
        action={
          <Link href="/accounts/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Conta
            </Button>
          </Link>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as AccountFilter)}>
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="revenue">Receitas</TabsTrigger>
          <TabsTrigger value="expense">Despesas</TabsTrigger>
          <TabsTrigger value="cost">Custos</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <AccountList type={filter === "all" ? undefined : filter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
