import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TSStyles } from "./cabinet/foundation";
import { Providers } from "./providers";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata = {
  title: "ТокенСток — кабинет",
  description: "Маркетплейс нейросетей. 218 моделей под одним ключом. Платишь только за факт использования.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#faf9f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${jetbrains.variable}`}>
      <body>
        <TSStyles />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
