import styles from "~/styles/home.module.css";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Calendar from "~/app/components/calender-tutor-view";
import Navigation from "~/app/components/navigation";

async function TutorViewPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <main className={styles.main}>
      <Navigation />
      <div className={styles.container}>
        <h1 className={styles.title}>Hello, {session.user.name}</h1>
        <h2 className={styles.title}>View Your Responds</h2>
        <Calendar />
      </div>
    </main>
  );
}

export default TutorViewPage;
