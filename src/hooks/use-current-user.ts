import { api } from "@/trpc/react";

export const useCurrentUser = () => {
  const { data: currentUser, isLoading } = api.user.me.useQuery();

  return {
    currentUser,
    isUserLoading: isLoading,
    isAdmin: currentUser?.role === "ADMIN" || currentUser?.role === "OWNER",
  };
};
