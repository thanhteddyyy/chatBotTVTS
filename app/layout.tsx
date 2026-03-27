import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Dùng Inter cho giống mẫu
import { Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const montserrat = Montserrat({ subsets: ["latin"] });


export const metadata: Metadata = {
  title: "Chatbot NPT - HCMUT",
  description: "Chatbot hỗ trợ tuyển sinh Bách khoa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" />
      </head>
      <body className={`${inter.className} antialiased mesh-gradient`}>
        {children}
      </body>
    </html>
  );
}