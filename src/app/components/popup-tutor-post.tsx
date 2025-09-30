"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/day-modal.module.css";

interface PopupTutorPostProps {
  date: Date;
  request: {
    id: number;
    date: Date;
    subject: string;
    fulfilled: boolean;
    fulfillerId: string | null;
    name: string;
    language: string;
  }[];
  onClose: () => void;
}

function PopupTutorPost({ date, request, onClose }: PopupTutorPostProps) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const utils = api.useUtils();

  const respondMutation = api.request.respond.useMutation({
    onSuccess: () => {
      setSuccess("Request responded successfully!");
      setError("");
      utils.tutorView.getAllFutureRequestRelative.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        <h2 className={styles.title}>
          {date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        {request.map((request) => (
          <div className={styles.info} key={request.id}>
            <span className={styles.label}>Unresponded Request:</span>
            <span className={styles.label}>Subject:</span>
            <span className={styles.value}>{request.subject}</span>
            <span className={styles.label}>Kid Name:</span>
            <span className={styles.value}>{request.name}</span>
            <span className={styles.label}>Language:</span>
            <span className={styles.value}>{request.language}</span>
            <button
              className={styles.registerButton}
              onClick={() => respondMutation.mutate({ requestId: request.id })}
            >
              Respond
            </button>
          </div>
        ))}
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </div>
  );
}

export default PopupTutorPost;
