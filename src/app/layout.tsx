import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { Menu } from "@/components/menu/menu";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";

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
    <html lang="en" className="bg-white text-black">
      <body className={`${opensans.variable}  antialiased font-opensans `}>
        <TRPCReactProvider>
          <HydrateClient>
            <div className="flex flex-col min-h-screen w-full">
              <Menu />
              {children}
              <div className="bg-neutral-100 px-[24px] py-[24px] flex items-center justify-center tracking-tight font-medium text-sm text-neutral-500">
                Copyright &copy; {new Date().getFullYear()} Humain
              </div>
            </div>
          </HydrateClient>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
