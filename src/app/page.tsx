import { auth } from "~/server/auth";
import styles from "./app.module.css";
import Calendar from "~/app/components/calendar";
import { redirect } from "next/navigation";
import Link from "next/link";

async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <center>
          <div className={styles.header}>
            <h1 className={styles.title}>Hello, {session.user.name}</h1>
          </div>
        </center>
        <Link href="/settings" className={styles.settingsLink}>
          Settings
        </Link>
        <Calendar />
      </div>
    </main>
  );
}

export default Home;
