"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  monthlyPostLimit: z.number().int().min(0, "Moet minimaal 0 zijn"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface EditTenantDialogProps {
  tenantId: string;
  tenantName: string;
  monthlyPostLimit: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditTenantDialog({
  tenantId,
  tenantName,
  monthlyPostLimit,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditTenantDialogProps) {
  const updateTenant = api.tenants.updateTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant bijgewerkt");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Fout bij bijwerken: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
    defaultValues: {
      name: tenantName,
      monthlyPostLimit: monthlyPostLimit,
    },
  });

  useEffect(() => {
    reset({ name: tenantName, monthlyPostLimit: monthlyPostLimit });
  }, [tenantName, monthlyPostLimit, reset]);

  const onSubmit = (data: TenantFormValues) => {
    updateTenant.mutate({
      id: tenantId,
      name: data.name,
      monthlyPostLimit: data.monthlyPostLimit,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Klant bewerken</DialogTitle>
          <DialogDescription>
            Wijzig de instellingen van de klant.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Naam
            </label>
            <Input id="name" {...register("name")} placeholder="Bedrijfsnaam" />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="monthlyPostLimit" className="text-sm font-medium">
              Maandelijkse Post Limiet
            </label>
            <Input
              id="monthlyPostLimit"
              type="number"
              {...register("monthlyPostLimit", { valueAsNumber: true })}
              placeholder="100"
            />
            {errors.monthlyPostLimit && (
              <p className="text-sm text-red-500 mt-1">
                {errors.monthlyPostLimit.message}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Aantal posts dat deze klant per maand mag aanmaken
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={updateTenant.isPending}>
              {updateTenant.isPending ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
