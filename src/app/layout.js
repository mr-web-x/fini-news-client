import { Montserrat, Tomorrow } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import BackLines from "@/components/BackLines/BackLines";
import { getMe } from "@/actions/auth.actions";

const montserratFont = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const tomorrowFont = Tomorrow({
  weight: ["400"], // ✅ ДОБАВЛЕНО: обязательный параметр
  variable: "--font-tomorrow", // ✅ ИСПРАВЛЕНО: было tommorow
  subsets: ["latin"],
});

export const metadata = {
  title: "Fini.sk - Finančné správy a analýzy",
  description: "Profesionálny finančný portál",
};

export default async function RootLayout({ children }) {
  let user = null;

  try {
    user = await getMe();
  } catch (error) {
    console.log('User not authenticated');
  }

  return (
    <html lang="sk">
      <body className={`${montserratFont.variable} ${tomorrowFont.variable}`}>
        <BackLines />
        <Header user={user} />
        {children}
        <Footer />
      </body>
    </html>
  );
}