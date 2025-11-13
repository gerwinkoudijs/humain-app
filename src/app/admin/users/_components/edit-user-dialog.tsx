"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "@/trpc/react";
import { Role } from "@generated/prisma";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.nativeEnum(Role),
  tenantId: z.string().uuid("Tenant is required"),
});

type UserFormValues = z.infer<typeof userSchema>;

interface EditUserDialogProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    tenantId: string | null;
  };
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const { data: tenants } = api.tenants.getTenants.useQuery();

  const updateUser = api.users.updateUser.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      tenantId: user.tenantId || "",
    },
  });

  useEffect(() => {
    reset({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      tenantId: user.tenantId || "",
    });
  }, [user, reset]);

  const onSubmit = (data: UserFormValues) => {
    updateUser.mutate({ id: user.id, ...data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white">
        <DialogHeader>
          <DialogTitle>Gebruiker bewerken</DialogTitle>
          <DialogDescription>
            Wijzig de gegevens van de gebruiker.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">
              Naam
            </label>
            <Input id="name" {...register("name")} placeholder="Volledige naam" />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@example.com"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="tenantId" className="text-sm font-medium">
              Klant
            </label>
            <Controller
              name="tenantId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een klant" />
                  </SelectTrigger>
                  <SelectContent>
                    {tenants?.map((tenant) => (
                      <SelectItem key={tenant.id} value={tenant.id}>
                        {tenant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tenantId && (
              <p className="text-sm text-red-500 mt-1">
                {errors.tenantId.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="role" className="text-sm font-medium">
              Rol
            </label>
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een rol" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(Role).map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuleren
            </Button>
            <Button type="submit" disabled={updateUser.isPending}>
              {updateUser.isPending ? "Opslaan..." : "Opslaan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
