import "./globals.css";

export const metadata = {
  title: "AethraCore",
  description: "Next.js application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
