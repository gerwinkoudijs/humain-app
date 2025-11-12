"use client";

import { api } from "@/trpc/react";
import { useParams } from "next/navigation";
import { SidebarMenuButton, SidebarMenuItem } from "../ui/sidebar";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { InlineLoader, Loader } from "../ui/loader";
import { chat_sessions } from "@generated/prisma";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDistanceToNow } from "date-fns";

const RecentCreationItem = ({
  item,
  isActive,
}: {
  item: Omit<chat_sessions, "image_base64">;
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
    <Tooltip>
      <TooltipTrigger className="w-full flex items-center justify-start">
        <SidebarMenuItem key={item.id} className="w-full" title="">
          <SidebarMenuButton
            asChild
            isActive={isActive}
            className="data-[active=true]:bg-stone-200 hover:bg-stone-200 data-[active=true]:font-normal w-full"
            title=""
          >
            <div className="flex items-center justify-between group/item relative">
              <Link href={`/sessions/${item.id}`} className="w-full" title="">
                <div className="text-left whitespace-nowrap truncate max-w-[200px] w-full">
                  {item.title}
                </div>
              </Link>
              {isPending ? (
                <InlineLoader />
              ) : (
                <Trash2
                  className="absolute right-1 hidden group-hover/item:block transition-all text-stone-500 hover:text-red-600 cursor-pointer"
                  onClick={() => deleteSession({ sessionId: item.id })}
                />
              )}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        sideOffset={12}
        className="bg-white text-black border [&_svg]:hidden!"
      >
        {formatDistanceToNow(item.created_at)} ago
      </TooltipContent>
    </Tooltip>
  );
};

export const RecentCreations = () => {
  const params = useParams();
  const urlSessionId = params.sessionId as string;

  const { isLoading, data } = api.chatSessions.listSessions.useQuery(
    {},
    { refetchInterval: 10000 }
  );

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-start px-2">
        <InlineLoader />
      </div>
    );
  }

  return (data ?? []).map((item) => (
    <RecentCreationItem
      key={item.id}
      isActive={item.id === urlSessionId}
      item={item}
    />
  ));
};
