import Image from "next/image";
import { Button } from "./ui/button";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { SignOutButton } from "@clerk/nextjs";

interface HeaderProps {
  userId: string;
  accountId: string;
}

const Header = async ({ userId, accountId }: HeaderProps) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader accountId={accountId} ownerId={userId} />

        <SignOutButton>
          <Button className="sign-out-button">
            <Image
              src={"/assets/icons/logout.svg"}
              alt="logout"
              width={24}
              height={24}
              className="w-6"
            />
          </Button>
        </SignOutButton>
      </div>
    </header>
  );
};

export default Header;
