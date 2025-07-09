import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Toaster } from '@/components/ui/sonner';

// Подключаем утилиты администратора для консоли разработчика
if (typeof window !== 'undefined') {
  import('@/lib/adminUtils');
  import('@/lib/setupAdmin');
}

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Управление мероприятиями",
  description: "Приложение для создания и управления мероприятиями",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            <ProtectedRoute>
              <Sidebar />
              <div className="flex flex-col h-screen">
                <Header />
                <main className="flex-1 overflow-auto pb-16 md:pb-0">
                  {children}
                </main>
              </div>
              <MobileBottomNav />
            </ProtectedRoute>
          </SidebarProvider>
        </AuthProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
