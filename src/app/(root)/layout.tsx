import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CartProvider from "@/components/CartProvider";
import CartNotification from "@/components/CartNotification";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <Navbar />
      {children}
      <Footer />
      <CartNotification />
    </CartProvider>
  );
}