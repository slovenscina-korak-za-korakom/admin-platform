import AccountCard from "@/app/(protected)/settings/_components/account-card";
import EmailCard from "@/app/(protected)/settings/_components/email-card";
import PasswordCard from "@/app/(protected)/settings/_components/password-card";
import TutorProfileCard from "@/app/(protected)/settings/_components/tutor-profile-card";
import { SettingsNav } from "@/app/(protected)/settings/_components/settings-nav";
import PreferencesCard from "@/app/(protected)/settings/_components/preferences-card";

const SettingsPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) => {
  const { section = "account" } = await searchParams;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your account and profile preferences.
        </p>
      </div>
      <div className="flex flex-col md:flex-row md:gap-10">
        <SettingsNav activeSection={section} />
        <div className="flex-1 min-w-0 mt-4 md:mt-0">
          {section === "account" && <AccountCard />}
          {section === "email" && <EmailCard />}
          {section === "password" && <PasswordCard />}
          {section === "tutor-profile" && <TutorProfileCard />}
          {section === "preferences" && <PreferencesCard />}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
