"use client";

import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Role } from "@generated/prisma";
import { toast } from "sonner";
import { useState } from "react";
import { Building, Edit, Trash2, Eye } from "lucide-react";
import { CreateTenantDialog } from "./_components/create-tenant-dialog";
import { EditTenantDialog } from "./_components/edit-tenant-dialog";
import Link from "next/link";

export default function TenantsPage() {
  const {
    data: tenants,
    isLoading,
    refetch,
  } = api.tenants.getTenants.useQuery();
  const { data: currentUser } = api.user.me.useQuery();
  const [editingTenant, setEditingTenant] = useState<{
    id: string;
    name: string;
    monthlyPostLimit: number;
  } | null>(null);

  const deleteTenant = api.tenants.deleteTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete tenant: ${error.message}`);
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (
      confirm(
        `Weet je zeker dat je klant "${name}" wilt verwijderen? Dit verwijdert ook alle gebruikers.`
      )
    ) {
      deleteTenant.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (currentUser?.role !== Role.ADMIN) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg text-red-500">
          You are not authorized to view this page.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building className="h-8 w-8" />
            Klantenbeheer
          </h1>
          <p className="text-gray-500 mt-1">
            Beheer klanten en hun gebruikers
          </p>
        </div>
        <CreateTenantDialog onSuccess={() => refetch()} />
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Naam</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Gebruikers</TableHead>
              <TableHead>Aangemaakt</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  Geen klanten gevonden. Maak je eerste klant aan.
                </TableCell>
              </TableRow>
            ) : (
              tenants?.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {tenant.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {tenant.slug}
                    </code>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary" className="font-mono">
                      {tenant.users.length}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {new Date(tenant.createdAt).toLocaleDateString("nl-NL")}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/tenants/${tenant.id}`}>
                        <Button variant="ghost" size="sm" title="Bekijk details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingTenant({
                            id: tenant.id,
                            name: tenant.name,
                            monthlyPostLimit: tenant.monthlyPostLimit,
                          })
                        }
                        title="Bewerken"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(tenant.id, tenant.name)}
                        disabled={deleteTenant.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        title="Verwijderen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {editingTenant && (
        <EditTenantDialog
          tenantId={editingTenant.id}
          tenantName={editingTenant.name}
          monthlyPostLimit={editingTenant.monthlyPostLimit}
          isOpen={!!editingTenant}
          onOpenChange={(open) => !open && setEditingTenant(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
