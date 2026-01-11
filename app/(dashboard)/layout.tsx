"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession, useActiveOrganization } from "@/lib/auth-client";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isPending: isSessionLoading } = useSession();
  const { data: activeOrg, isPending: isOrgLoading } = useActiveOrganization();

  // Show loading state while checking auth
  if (isSessionLoading || isOrgLoading) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background">
          <div className="flex h-14 items-center border-b px-4">
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex-1 px-3 py-4 space-y-2">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="h-14 border-b px-4 flex items-center">
            <Skeleton className="h-8 w-40" />
          </div>
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    router.push("/login");
    return null;
  }

  // Redirect to org selection if no active organization
  if (!activeOrg) {
    router.push("/select-organization");
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
