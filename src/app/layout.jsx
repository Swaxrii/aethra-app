import "./globals.css";
import "./cinematic.css";
import "./refinements.css";
import Atmosphere from "@/components/Atmosphere";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Aethra AI",
  description: "Next.js application",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-dvh flex">
        <>
          <Atmosphere />
          <Sidebar />
          <main className="relative z-10 min-w-0 flex flex-1 flex-col">{children}</main>
        </>
      </body>
    </html>
  );
}
