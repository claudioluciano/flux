"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useSession,
  useListOrganizations,
  organization,
} from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Loader2, Plus, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";

export default function SelectOrganizationPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const { data: orgs, isPending: orgsLoading } = useListOrganizations();

  const [showCreate, setShowCreate] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSelecting, setIsSelecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!sessionLoading && !session?.user) {
    router.push("/login");
    return null;
  }

  const handleSelectOrg = async (orgId: string) => {
    setIsSelecting(orgId);
    setError(null);
    try {
      await organization.setActive({ organizationId: orgId });
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao selecionar organizacao");
      setIsSelecting(null);
    }
  };

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setError(null);

    try {
      const result = await organization.create({
        name: newOrgName,
        slug: newOrgSlug || newOrgName.toLowerCase().replace(/\s+/g, "-"),
      });

      if (result.error) {
        setError(result.error.message || "Erro ao criar organizacao");
        setIsCreating(false);
        return;
      }

      // Set the new organization as active
      if (result.data?.id) {
        await organization.setActive({ organizationId: result.data.id });
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar organizacao");
      setIsCreating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  if (sessionLoading || orgsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Selecionar Organizacao
            </CardTitle>
            <CardDescription>
              Escolha uma organizacao para continuar ou crie uma nova
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {/* Existing Organizations */}
            {orgs && orgs.length > 0 && (
              <div className="space-y-2">
                {orgs.map((org) => (
                  <Button
                    key={org.id}
                    variant="outline"
                    className="w-full justify-start gap-2"
                    disabled={isSelecting !== null || isCreating}
                    onClick={() => handleSelectOrg(org.id)}
                  >
                    {isSelecting === org.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Building2 className="h-4 w-4" />
                    )}
                    {org.name}
                  </Button>
                ))}
              </div>
            )}

            {/* No organizations message */}
            {(!orgs || orgs.length === 0) && !showCreate && (
              <p className="text-center text-sm text-muted-foreground">
                Voce ainda nao pertence a nenhuma organizacao.
              </p>
            )}

            {/* Create Organization Form */}
            {showCreate ? (
              <form onSubmit={handleCreateOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Nome da organizacao</Label>
                  <Input
                    id="orgName"
                    placeholder="Minha Empresa LTDA"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value);
                      setNewOrgSlug(generateSlug(e.target.value));
                    }}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSlug">Identificador (slug)</Label>
                  <Input
                    id="orgSlug"
                    placeholder="minha-empresa"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(generateSlug(e.target.value))}
                    required
                    disabled={isCreating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Usado na URL. Apenas letras minusculas, numeros e hifens.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreate(false)}
                    disabled={isCreating}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isCreating || !newOrgName.trim()}
                    className="flex-1"
                  >
                    {isCreating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Criar
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => setShowCreate(true)}
                disabled={isSelecting !== null}
              >
                <Plus className="h-4 w-4" />
                Criar nova organizacao
              </Button>
            )}
          </CardContent>
        </Card>

        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sair da conta
        </Button>
      </div>
    </div>
  );
}
