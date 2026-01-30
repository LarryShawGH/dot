import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/context/role-context";
import { AppLayout } from "@/components/layout/app-layout";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Architecture Review Automation",
  description: "Architecture Review Automation - Government & Enterprise SaaS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased min-h-screen text-slate-900`}>
        <RoleProvider>
          <AppLayout>{children}</AppLayout>
        </RoleProvider>
      </body>
    </html>
  );
}
