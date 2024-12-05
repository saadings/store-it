"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { navItems } from "@/constants";
import { cn } from "@/lib/utils";
import { SignOutButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const MobileNavigation = () => {
  const { user } = useUser();
  const pathname = usePathname();
  const convexUser = useQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });
  const [open, setOpen] = useState(false);

  return (
    <header className="mobile-header">
      <Image
        src={"/assets/icons/logo-full-brand.svg"}
        alt="logo"
        width={120}
        height={52}
        className="h-auto"
      />

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger>
          <Image
            src={"/assets/icons/menu.svg"}
            alt="search"
            width={30}
            height={30}
          />
        </SheetTrigger>
        <SheetContent className="shad-sheet h-screen px-3">
          <SheetTitle>
            <div className="header-user">
              <Image
                src={user?.imageUrl ?? "/assets/images/avatar.png"}
                alt={user?.fullName ?? "avatar"}
                width={44}
                height={44}
                className="header-user-avatar"
              />

              <div className="sm:hidden lg:block">
                <p className="subtitle-2 capitalize">{user?.fullName}</p>
                <p className="caption">
                  {user?.emailAddresses.at(0)?.emailAddress}
                </p>
              </div>
            </div>

            <Separator className="mb-4 bg-light-200/20" />
          </SheetTitle>

          <SheetDescription></SheetDescription>
          <nav className="mobile-nav">
            <ul className="mobile-nav-list">
              {navItems.map(({ url, name, icon }) => (
                <Link key={name} href={url} className="lg:w-full">
                  <li
                    className={cn(
                      "mobile-nav-item",
                      pathname === url && "shad-active",
                    )}
                  >
                    <Image
                      src={icon}
                      alt={name}
                      width={24}
                      height={24}
                      className={cn(
                        "nav-icon",
                        pathname === url && "nav-icon-active",
                      )}
                    />
                    <p>{name}</p>
                  </li>
                </Link>
              ))}
            </ul>
          </nav>

          <Separator className="my-5 bg-light-200/20" />

          <div className="flex flex-col justify-between gap-5 pb-5">
            {convexUser && (
              <FileUploader accountId={user!.id} ownerId={convexUser!._id} />
            )}
            <SignOutButton>
              <Button className="mobile-sign-out-button">
                <Image
                  src={"/assets/icons/logout.svg"}
                  alt="logout"
                  width={24}
                  height={24}
                />
                <p>Logout</p>
              </Button>
            </SignOutButton>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileNavigation;
