import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import styles from "./app.module.css";

async function SigninPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.loginCard}>
          <h1 className={styles.title}>Welcome Back</h1>
          <p className={styles.subtitle}>Sign in to your account</p>

          <Link href="/api/auth/signin" className={styles.loginButton}>
            Sign in with Discord
          </Link>

          <p className={styles.footerText}>
            Don&apos;t have an account? You&apos;ll be redirected to create one.
          </p>
        </div>
      </div>
    </main>
  );
}

export default SigninPage;
