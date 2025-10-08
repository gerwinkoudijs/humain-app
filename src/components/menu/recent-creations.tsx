"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";

export const RecentCreations = () => {
  const params = useParams();
  const urlSessionId = params.sessionId as string;

  const { isLoading, data } = api.chatSessions.listSessions.useQuery(
    {},
    { refetchInterval: 10000 }
  );

  return (data ?? []).map((item) => (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        asChild
        isActive={item.id === urlSessionId}
        className="data-[active=true]:bg-stone-200 hover:bg-stone-200 data-[active=true]:font-normal"
      >
        <Link
          href={`/sessions/${item.id}`}
          className="w-full  whitespace-nowrap truncate text-ellipsis"
        >
          {item.title}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ));
};
