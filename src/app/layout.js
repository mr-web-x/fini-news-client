import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BackLines from "@/components/BackLines/BackLines";
import { getMe } from "@/actions/auth.actions"; // ✅ ДОБАВЛЕНО

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fini.sk - Finančné správy a analýzy",
  description: "Profesionálny finančný portál",
};

export default async function RootLayout({ children }) {
  // ✅ ДОБАВЛЕНО: Получаем пользователя на сервере (SSR)
  let user = null;

  try {
    user = await getMe();
  } catch (error) {
    // Если пользователь не авторизован - ничего не делаем
    console.log('User not authenticated');
  }

  return (
    <html lang="sk">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <BackLines />
        <Header user={user} /> {/* ✅ ПЕРЕДАЁМ user */}
        {children}
        <Footer />
      </body>
    </html>
  );
}