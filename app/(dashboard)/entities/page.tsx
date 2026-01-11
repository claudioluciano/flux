"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { EntityList } from "@/components/entities/entity-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus } from "lucide-react";

export default function EntitiesPage() {
  const [filter, setFilter] = useState<"all" | "clients" | "suppliers" | "both">(
    "all"
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Entidades"
        description="Gerencie seus clientes e fornecedores"
        action={
          <Link href="/entities/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nova Entidade
            </Button>
          </Link>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="clients">Clientes</TabsTrigger>
          <TabsTrigger value="suppliers">Fornecedores</TabsTrigger>
          <TabsTrigger value="both">Ambos</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-4">
          <EntityList filter={filter} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
