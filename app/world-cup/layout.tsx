import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function WorldCupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-[#f2f4ef] text-zinc-950">
      <Navbar />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
