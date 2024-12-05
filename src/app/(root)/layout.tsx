import Header from "@/components/Header";
import MobileNavigation from "@/components/MobileNavigation";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { api } from "@/convex/_generated/api";
import { currentUser } from "@clerk/nextjs/server";
import { preloadQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { type PropsWithChildren } from "react";

const HomeLayout = async ({ children }: PropsWithChildren) => {
  const user = await currentUser();
  if (!user) return redirect("/sign-in");

  const preloadedUser = (await preloadQuery(api.users.getUserByClerkId, {
    clerkId: user.id,
  })) as unknown as { _valueJSON: { _id: string } };

  if (!preloadedUser) return redirect("/sign-in");

  return (
    <main className="flex h-screen">
      <Sidebar />
      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation />
        <Header userId={preloadedUser._valueJSON!._id} accountId={user.id} />
        <div className="main-content">{children}</div>
      </section>
      <Toaster />
    </main>
  );
};

export default HomeLayout;
