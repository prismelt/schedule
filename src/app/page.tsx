import { auth } from "~/server/auth";
import NextSession from "~/app/components/session";
import { HydrateClient } from "~/trpc/server";
import styles from "./index.module.css";

async function Home() {
  const session = await auth();
  if (!session?.user) {
    return (
      <HydrateClient>
        <main className={styles.main}>
          <div className={styles.container}>
            <h1 className={styles.title}>Register for a Session</h1>
            <p className={styles.description}>Please log in to continue.</p>
          </div>
        </main>
      </HydrateClient>
    );
  }

  return (
    <HydrateClient>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>Register for a Session</h1>
          <NextSession />
        </div>
      </main>
    </HydrateClient>
  );
}

export default Home;
