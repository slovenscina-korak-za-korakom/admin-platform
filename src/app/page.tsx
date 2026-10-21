import {redirect} from "next/navigation";
import {currentUser} from "@clerk/nextjs/server";
import {Button} from "@/components/ui/button";
import {IconDashboard, IconExternalLink, IconLogout} from "@tabler/icons-react";
import Link from "next/link";
import {SignOutButton} from "@clerk/nextjs";

const Page = async () => {

  const user = await currentUser();
  const adminUsers = process.env.ADMIN_USERS?.split(",");
  if (!user) {
    redirect("/sign-in");
  }
  const isAdmin = adminUsers?.includes(user.emailAddresses[0].emailAddress);
  if (user && isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div className="flex flex-col gap-4 justify-center items-center">
        {!isAdmin ? (
          <>
            <h1 className="text-red-400 font-bold text-3xl">You do not have permission to be here!</h1>
            <p className="text-foreground/50 italic">No access on {user?.emailAddresses[0].emailAddress}</p>
            <div className={"flex flex-row items-center gap-2"}>
              <Button asChild>
                <a href="https://www.slovenscinakzk.com" target="_self" rel="noopener noreferrer">
                <span className="inline-flex items-center gap-2">
                  <IconExternalLink/>
                  Go to slovenscinakzk.com
                </span>
                </a>
              </Button>
              <Button asChild>
                <SignOutButton>
                <span className="inline-flex items-center gap-2">
                  <IconLogout/>
                Sign Out
                </span>
                </SignOutButton>
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-5 items-center justify-center">
            <div>
              <h1 className="text-2xl font-semibold">Welcome back: {user.firstName}</h1>
              <p className="text-foreground/50">Reload the page or press the button to get to dashboard</p>
            </div>
            <Button asChild>
              <Link href="/dashboard">
                <span className="inline-flex items-center gap-2">
                  <IconDashboard/>
                  Go to dashboard
                </span>

              </Link>
            </Button>

          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
