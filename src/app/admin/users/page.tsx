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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { Users, Edit, Trash2, Filter } from "lucide-react";
import { CreateUserDialog } from "./_components/create-user-dialog";
import { EditUserDialog } from "./_components/edit-user-dialog";
import Link from "next/link";
import { PageLoader } from "@/components/ui/page-loader";

export default function UsersPage() {
  const [selectedTenantId, setSelectedTenantId] = useState<string | undefined>(
    undefined
  );
  const [editingUser, setEditingUser] = useState<{
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    tenantId: string | null;
  } | null>(null);

  const { data: tenants } = api.tenants.getTenants.useQuery();
  const {
    data: users,
    isLoading,
    refetch,
  } = api.users.getUsers.useQuery(
    selectedTenantId ? { tenantId: selectedTenantId } : undefined
  );
  const { data: currentUser } = api.user.me.useQuery();

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

  if (currentUser?.role !== Role.ADMIN && currentUser?.role !== Role.OWNER) {
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
            <Users className="h-8 w-8" />
            Gebruikersbeheer
          </h1>
          <p className="text-gray-500 mt-1">
            Beheer alle gebruikers in het systeem
          </p>
        </div>
        <CreateUserDialog onSuccess={() => refetch()} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <span className="text-sm font-medium">Filter op klant:</span>
        <Select
          value={selectedTenantId || "all"}
          onValueChange={(value) =>
            setSelectedTenantId(value === "all" ? undefined : value)
          }
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle klanten</SelectItem>
            {tenants?.map((tenant) => (
              <SelectItem key={tenant.id} value={tenant.id}>
                {tenant.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedTenantId && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedTenantId(undefined)}
          >
            Reset filter
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naam</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Klant</TableHead>
              <TableHead className="text-right">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-gray-500"
                >
                  {selectedTenantId
                    ? "Geen gebruikers gevonden voor deze klant."
                    : "Geen gebruikers gevonden."}
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => (
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
                    {user.tenant ? (
                      <Link
                        href={`/admin/tenants/${user.tenant.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {user.tenant.name}
                      </Link>
                    ) : (
                      <span className="text-gray-400 italic">Geen klant</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
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
    </div>
  );
}
