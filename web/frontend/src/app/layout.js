import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "FinLedger | Private Wealth Tracker",
  description:
    "Institutional-grade personal finance command center — track expenses, investments, and net worth."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
