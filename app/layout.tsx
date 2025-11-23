import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dulite Dev - نظام إدارة تعلم ذكي",
  description: "موقع ذكي للطلاب والمعلمين. ارفع المواد، اسأل، واحصل على إجابات فورية باستخدام الذكاء الاصطناعي.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-gray-900 text-gray-100">
            <Header />
            <main className="container mx-auto p-4 md:p-6">
              {children}
            </main>
          </div>
          <Toaster 
            position="bottom-center"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
