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
import {
  ArrowLeft,
  Building,
  Edit,
  Trash2,
  UserPlus,
  Users,
  UserCog,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateUserDialog } from "../../users/_components/create-user-dialog";
import { EditUserDialog } from "../../users/_components/edit-user-dialog";
import { EditTenantDialog } from "../_components/edit-tenant-dialog";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useImpersonation } from "@/hooks/use-impersonation";
import { PageLoader } from "@/components/ui/page-loader";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = params.id as string;
  const { startImpersonation } = useImpersonation();

  const {
    data: tenant,
    isLoading,
    refetch,
  } = api.tenants.getTenant.useQuery({ id: tenantId });
  const { data: currentUser } = api.user.me.useQuery();

  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    tenantId: string | null;
  } | null>(null);

  const [isEditingTenant, setIsEditingTenant] = useState(false);

  const handleImpersonate = (userId: string, userName: string | null) => {
    const displayName = userName || "gebruiker";
    if (
      confirm(
        `Weet je zeker dat je wilt inloggen als "${displayName}"?\n\nJe wordt doorgestuurd naar hun account.`
      )
    ) {
      startImpersonation(userId, displayName);
    }
  };

  const deleteUser = api.users.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("User deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  const handleDelete = (id: string, email: string | null) => {
    if (
      confirm(`Weet je zeker dat je gebruiker "${email}" wilt verwijderen?`)
    ) {
      deleteUser.mutate({ id });
    }
  };

  const getRoleBadgeVariant = (role: Role) => {
    switch (role) {
      case Role.OWNER:
        return "destructive";
      case Role.ADMIN:
        return "default";
      case Role.USER:
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-lg text-red-500">Tenant not found</div>
        <Link href="/admin/tenants">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tenants
          </Button>
        </Link>
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
      <div className="mb-6">
        <Link href="/admin/tenants">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Terug naar klanten
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Building className="h-8 w-8" />
              {tenant.name}
            </h1>
            <p className="text-gray-500 mt-1">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                {tenant.slug}
              </code>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Aangemaakt op{" "}
              {new Date(tenant.createdAt).toLocaleDateString("nl-NL")}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setIsEditingTenant(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Bewerk klant
          </Button>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Posts Deze Maand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tenant.postsThisMonth}</p>
            <p className="text-xs text-gray-500 mt-1">
              van {tenant.monthlyPostLimit} limiet
            </p>
          </CardContent>
        </Card>

        <Card
          className={
            tenant.postsThisMonth >= tenant.monthlyPostLimit
              ? "border-red-500"
              : ""
          }
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Gebruik
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Percentage</span>
                <span className="font-semibold">
                  {(
                    (tenant.postsThisMonth / tenant.monthlyPostLimit) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    tenant.postsThisMonth >= tenant.monthlyPostLimit
                      ? "bg-red-500"
                      : tenant.postsThisMonth / tenant.monthlyPostLimit > 0.8
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      (tenant.postsThisMonth / tenant.monthlyPostLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {tenant.postsThisMonth >= tenant.monthlyPostLimit ? (
                <>
                  <Badge variant="destructive">Limiet bereikt</Badge>
                </>
              ) : (
                <>
                  <Badge variant="success">Actief</Badge>
                  <span className="text-xs text-gray-500">
                    {tenant.monthlyPostLimit - tenant.postsThisMonth} over
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-semibold">Gebruikers</h2>
            <Badge variant="secondary" className="font-mono">
              {tenant.users.length}
            </Badge>
          </div>
          <CreateUserDialog
            preselectedTenantId={tenantId}
            onSuccess={() => refetch()}
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenant.users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-8 text-gray-500"
                >
                  Geen gebruikers gevonden. Voeg de eerste gebruiker toe.
                </TableCell>
              </TableRow>
            ) : (
              tenant.users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.name || (
                      <span className="text-gray-400 italic">Geen naam</span>
                    )}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={getRoleBadgeVariant(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {user.role !== Role.ADMIN && user.role !== Role.OWNER && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleImpersonate(user.id, user.name)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Inloggen als gebruiker"
                        >
                          <UserCog className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingUser({
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            role: user.role,
                            tenantId: user.tenantId,
                          })
                        }
                        title="Bewerken"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id, user.email)}
                        disabled={deleteUser.isPending}
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

      {editingUser && (
        <EditUserDialog
          user={editingUser}
          isOpen={!!editingUser}
          onOpenChange={(open) => !open && setEditingUser(null)}
          onSuccess={() => refetch()}
        />
      )}

      {isEditingTenant && (
        <EditTenantDialog
          tenantId={tenant.id}
          tenantName={tenant.name}
          monthlyPostLimit={tenant.monthlyPostLimit}
          isOpen={isEditingTenant}
          onOpenChange={setIsEditingTenant}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
}
