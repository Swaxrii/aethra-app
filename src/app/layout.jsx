import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "AethraCore",
  description: "Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex overflow-hidden">
        <Sidebar />
        <main className="relative z-10 flex flex-1 items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
