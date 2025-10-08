import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Menu } from "@/components/menu/menu";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-separator";

const opensans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yourstyle AI",
  description: "Yourstyle AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-white text-black text-[15px]">
      <body className={`${opensans.variable}  antialiased font-opensans `}>
        <TRPCReactProvider>
          <HydrateClient>
            {/* <div className="flex flex-col min-h-screen w-full">
              <Menu />
              {children}
              <div className="bg-neutral-100 px-[24px] py-[24px] flex items-center justify-center tracking-tight font-medium text-sm text-neutral-500">
                Copyright &copy; {new Date().getFullYear()} Humain
              </div>
            </div> */}
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="bg-white sticky top-0 flex h-16 shrink-0 items-center gap-2 border-b px-4">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="#">Yourstyle AI</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem>
                        <BreadcrumbPage>Generate Social Post</BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
              </SidebarInset>
            </SidebarProvider>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
