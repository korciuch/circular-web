import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circular",
  description: "Payments and lending for growing businesses",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="bg-white text-slate-900 antialiased">
        <header className="border-b border-slate-200">
          <div className="mx-auto max-w-3xl px-4 py-4">
            <span className="text-sm font-semibold tracking-tight">Circular</span>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
