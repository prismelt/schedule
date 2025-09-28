"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import styles from "../signin/app.module.css";

function SignInForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        email,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or email");
      } else {
        window.location.href = "/";
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(`Error in signing in: ${error.message}`);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleCredentialsSignIn} className={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={styles.input}
        />
        <button
          type="submit"
          disabled={isLoading}
          className={styles.signinButton}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      {/* <div className={styles.divider}>
        <span>or</span>
      </div>

      <Link href="/api/auth/signin/discord" className={styles.discordButton}>
        Sign in with Discord
      </Link> */}
    </div>
  );
}

export default SignInForm;
