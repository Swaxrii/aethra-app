import "./globals.css";
import Sidebar from "@/components/Sidebar";
import AuthGuard from "@/components/AuthGuard";

export const metadata = {
  title: "Aethra AI",
  description: "Next.js application",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex overflow-hidden">
        <AuthGuard>
          <Sidebar />
          <main className="relative z-10 flex flex-1 items-center justify-center">{children}</main>
        </AuthGuard>
      </body>
    </html>
  );
}
