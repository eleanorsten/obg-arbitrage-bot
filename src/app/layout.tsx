import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OBG ArbBot — Oil Arbitrage Dashboard",
  description: "Real-time oil arbitrage monitoring and execution",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
