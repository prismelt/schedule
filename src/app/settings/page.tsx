import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SettingsContent from "../components/settings-content";
import styles from "./settings.module.css";

async function SettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Settings</h1>
        <SettingsContent />
      </div>
    </main>
  );
}

export default SettingsPage;
