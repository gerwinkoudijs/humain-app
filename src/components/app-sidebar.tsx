"use client";

import {
  Building,
  ChevronRight,
  Earth,
  House,
  ImagePlus,
  LogOut,
  Settings2,
  User,
  UserCog,
  X,
} from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { ProfileDialog } from "@/features/settings/profile-dialog";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { RecentCreations } from "./menu/recent-creations";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useImpersonation } from "@/hooks/use-impersonation";

// This is sample data.
const data = {
  version: "0.1.3",
  navMain: [
    {
      title: "Menu",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: <House />,
        },
        {
          title: "Genereer Social Post",
          url: "/generate",
          icon: <ImagePlus />,
        },
        {
          title: "Genereer via URL",
          url: "/from-url",
          icon: <Earth />,
        },
      ],
    },
    {
      isAdmin: true,
      title: "Beheer",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/admin/dashboard",
          icon: <House />,
        },
        {
          title: "Klanten",
          url: "/admin/tenants",
          icon: <Building />,
        },
        {
          title: "Instellingen",
          url: "/admin/settings",
          icon: <Settings2 />,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname();
  const { data: session, status } = useSession();
  const { currentUser, isAdmin } = useCurrentUser();
  const { stopImpersonation } = useImpersonation();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  // Check if currently impersonating from session
  const isImpersonating = session?.isImpersonating || false;

  if (status === "loading") {
    // You can return a skeleton loader here if you want
    return null;
  }

  if (status === "unauthenticated") {
    return null;
  }

  return (
    <Sidebar {...props} className="bg-stone-100">
      <SidebarHeader className="bg-stone-100">
        <div className="flex font-semibold w-full justify-start items-center pt-2 py-1 px-2 gap-2">
          <div className="">Yourstyle</div>
          <div className="bg-primary text-white rounded-lg px-3 py-1.5">AI</div>
          <div className="absolute right-4 top-2 text-[10px] text-gray-400 font-mono z-40">
            v0.1.4
          </div>
        </div>
        {isImpersonating && (
          <div className="mx-2 mt-2 p-3 bg-orange-100 border border-orange-300 rounded-lg">
            <div className="flex items-start gap-2">
              <UserCog className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-orange-800">
                  Impersonatie Actief
                </p>
                <p className="text-xs text-orange-700 mt-0.5">
                  Je bekijkt als {session?.user?.name || "gebruiker"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={stopImpersonation}
                className="h-6 w-6 p-0 hover:bg-orange-200 flex-shrink-0"
                title="Stop impersonatie"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent className="gap-0 bg-stone-100">
        {/* We create a collapsible SidebarGroup for each parent. */}
        {data.navMain
          .filter((m) => !m.isAdmin || !!isAdmin)
          .map((item) => (
            <Collapsible
              key={item.title}
              title={item.title}
              defaultOpen
              className="group/collapsible"
            >
              <SidebarGroup>
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <CollapsibleTrigger>
                    {item.title}{" "}
                    <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                  </CollapsibleTrigger>
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {item.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            isActive={path.startsWith(item.url)}
                            className="data-[active=true]:bg-stone-200 hover:bg-stone-200 data-[active=true]:font-normal"
                          >
                            <Link href={item.url}>
                              {item.icon}
                              <div>{item.title}</div>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        <Collapsible
          title={"Recente Opdrachten"}
          defaultOpen
          className="group/collapsible"
        >
          <SidebarGroup>
            <SidebarGroupLabel
              asChild
              className="group/label text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <CollapsibleTrigger>
                {"Recente Opdrachten"}{" "}
                <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </CollapsibleTrigger>
            </SidebarGroupLabel>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  <RecentCreations />
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </SidebarGroup>
        </Collapsible>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2" />
              {currentUser?.name}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => setProfileDialogOpen(true)}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ProfileDialog
          isOpen={profileDialogOpen}
          onOpenChange={setProfileDialogOpen}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
