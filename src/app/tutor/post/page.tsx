import styles from "~/styles/home.module.css";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Calendar from "~/app/components/calender-tutor-post";
import Navigation from "~/app/components/navigation";
import { SessionProvider } from "next-auth/react";

async function TutorPostPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/signin");
  }
  return (
    <SessionProvider session={session}>
      <main className={styles.main}>
        <Navigation />
        <div className={styles.container}>
          <h1 className={styles.title}>Hello, {session.user.name}</h1>
          <h2 className={styles.title}>View All Requests</h2>
          <Calendar />
        </div>
      </main>
    </SessionProvider>
  );
}

export default TutorPostPage;
