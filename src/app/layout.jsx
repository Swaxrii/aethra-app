import "./globals.css";
import "./cinematic.css";
import "./refinements.css";
import Atmosphere from "@/components/Atmosphere";
import Sidebar from "@/components/Sidebar";
import Preferences from "@/components/Preferences";

export const metadata = {
  title: "Aethra AI",
  description: "Next.js application",
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex overflow-hidden">
        <>
          <Atmosphere />
          <Preferences />
          <Sidebar />
          <main className="relative z-10 min-w-0 flex flex-1 items-center justify-center">
            {children}
          </main>
        </>
      </body>
    </html>
  );
}
