"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { InlineLoader, Loader } from "../ui/loader";
import { chat_sessions } from "@generated/prisma";

const RecentCreationItem = ({
  item,
  isActive,
}: {
  item: chat_sessions;
  isActive: boolean;
}) => {
  const utils = api.useUtils();

  const { mutate: deleteSession, isPending } =
    api.chatSessions.deleteSession.useMutation({
      onSuccess: () => {
        utils.chatSessions.listSessions.invalidate();
        utils.chatSessions.listSessions.setData({}, (old) =>
          old?.filter((s) => s.id !== item.id)
        );
      },
    });

  return (
    <SidebarMenuItem key={item.id}>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        className="data-[active=true]:bg-stone-200 hover:bg-stone-200 data-[active=true]:font-normal"
      >
        <div className="flex items-center justify-between group/item">
          <Link
            href={`/sessions/${item.id}`}
            className="w-full  whitespace-nowrap truncate text-ellipsis"
          >
            {item.title}
          </Link>
          {isPending ? (
            <InlineLoader />
          ) : (
            <Trash2
              className="hidden group-hover/item:block transition-all text-stone-500 hover:text-red-600 cursor-pointer"
              onClick={() => deleteSession({ sessionId: item.id })}
            />
          )}
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};

export const RecentCreations = () => {
  const params = useParams();
  const urlSessionId = params.sessionId as string;

  const { isLoading, data } = api.chatSessions.listSessions.useQuery(
    {},
    { refetchInterval: 10000 }
  );

  return (data ?? []).map((item) => (
    <RecentCreationItem
      key={item.id}
      isActive={item.id === urlSessionId}
      item={item}
    />
  ));
};
