// src/app/dashboard/tenants/page.tsx
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
import { Role } from "@generated/prisma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { Building, Settings2 } from "lucide-react";
import { useCurrentUser } from "@/hooks/use-current-user";

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

export default function TenantsPage() {
  const {
    data: tenants,
    isLoading,
    refetch,
  } = api.tenants.getTenants.useQuery();
  const { currentUser } = useCurrentUser();
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const createTenant = api.tenants.createTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant created successfully");
      refetch();
      setCreateDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create tenant: ${error.message}`);
    },
  });

  const deleteTenant = api.tenants.deleteTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete tenant: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
  });

  const onCreateSubmit = (data: TenantFormValues) => {
    createTenant.mutate(data);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (currentUser?.role !== Role.ADMIN) {
    return <div>You are not authorized to view this page.</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 />
          Instellingen
        </h1>
      </div>
      <div>...</div>
    </div>
  );
}
