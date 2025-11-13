"use client";

import { useState } from "react";
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
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building } from "lucide-react";

const tenantSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

interface CreateTenantDialogProps {
  onSuccess?: () => void;
}

export function CreateTenantDialog({ onSuccess }: CreateTenantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);

  const createTenant = api.tenants.createTenant.useMutation({
    onSuccess: () => {
      toast.success("Tenant created successfully");
      setIsOpen(false);
      reset();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create tenant: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenantFormValues>({
    resolver: zodResolver(tenantSchema),
  });

  const onSubmit = (data: TenantFormValues) => {
    createTenant.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Building className="mr-2 h-4 w-4" />
          Klant aanmaken
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Nieuwe klant aanmaken</DialogTitle>
          <DialogDescription>
            Maak een nieuwe klant aan. Een slug wordt automatisch gegenereerd.
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
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={createTenant.isPending}>
              {createTenant.isPending ? "Aanmaken..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
