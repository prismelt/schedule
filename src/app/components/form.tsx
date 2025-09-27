"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import styles from "../index.module.css";

function RegisterForm() {
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const registerMutation = api.schedule.register.useMutation({
    onSuccess: () => {
      setSuccess("Successfully registered for session!");
      setError("");
      setDate("");
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a date");
      return;
    }
    registerMutation.mutate({ date });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className={styles.input}
        min={new Date().toISOString().split("T")[0]}
      />
      <button
        type="submit"
        disabled={registerMutation.isPending}
        className={styles.submitButton}
      >
        {registerMutation.isPending ? "Registering..." : "Register"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}
      <p style={{ color: "white" }}>selected date: {date}</p>
    </form>
  );
}

export default RegisterForm;
