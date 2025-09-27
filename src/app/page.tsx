import { auth } from "~/server/auth";
import styles from "./app.module.css";
import Calendar from "~/app/components/calendar";
import { redirect } from "next/navigation";

async function Home() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Hello, {session.user.name}</h1>
        <Calendar />
      </div>
    </main>
  );
}

export default Home;
