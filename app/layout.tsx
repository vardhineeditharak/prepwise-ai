import type { Metadata } from "next";
import "./globals.css";
import "@aejkatappaja/phantom-ui/ssr.css";
import { Navbar } from "@/components/navbar";
import PhantomUiInit from "@/components/phantom-ui-init";

export const metadata: Metadata = {
  title: "PrepWise AI — Interview Trainer",
  description: "AI-powered interview preparation with resume analysis and tailored questions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PhantomUiInit />
        <Navbar />
        {children}
      </body>
    </html>
  );
}
