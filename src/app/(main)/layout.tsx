import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MobileHeader } from "@/components/mobile-header";
import { Sidebar } from "@/components/sidebar";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <MobileHeader />
      <Sidebar className="hidden lg:flex" />
      <main className="lg:pl-[256px] h-full pt-[50px] lg:pt-0">
        <div className="max-w-[1056px] mx-auto h-full">{children}</div>
      </main>
    </>
  );
}
