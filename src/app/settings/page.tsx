import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import styles from "~/styles/settings.module.css";
import SettingsContent from "~/app/components/setting-content";
import Navigation from "~/app/components/navigation";

async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        <SettingsContent />
      </div>
    </main>
  );
}

export default SettingsPage;
