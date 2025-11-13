import AuthProvider from "@/components/auth-provider";
import { TRPCReactProvider } from "@/trpc/react";
import { HydrateClient } from "@/trpc/server";
import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";

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
        <AuthProvider>
          <TRPCReactProvider>
            <HydrateClient>
              <LayoutWrapper>{children}</LayoutWrapper>
            </HydrateClient>
          </TRPCReactProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
