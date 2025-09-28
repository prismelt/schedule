import { auth } from "~/server/auth";
import { redirect } from "next/navigation";
import SignInForm from "../components/signin-form";
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
          <h1 className={styles.title}>Welcome</h1>
          <p className={styles.subtitle}>Sign in to your account</p>

          <SignInForm />
        </div>
      </div>
    </main>
  );
}

export default SigninPage;
