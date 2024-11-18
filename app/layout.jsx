import Providers from "@/providers/Providers";
import "./globals.css";

export const metadata = {
  title: "Face Recognition Attendance",
  description: "Digital attendance system using face recognition",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
