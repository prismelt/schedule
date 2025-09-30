import styles from "~/styles/app.module.css";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Calendar from "~/app/components/calender-tutor-post";

async function TutorPostPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Hello, {session.user.name}</h1>
        <h2 className={styles.title}>View All Requests</h2>
        <Calendar />
      </div>
    </main>
  );
}

export default TutorPostPage;
