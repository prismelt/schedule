"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/day-modal.module.css";

interface PopupTutorViewProps {
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

function PopupTutorView({ date, request, onClose }: PopupTutorViewProps) {
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const utils = api.useUtils();
  const unrespondMutation = api.request.unrespond.useMutation({
    onSuccess: () => {
      setSuccess("Request unresponded successfully!");
      setError("");
      utils.tutorView.getAllTutorFutureView.invalidate().catch(() => {
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
            <span className={styles.label}>Request You Responded To:</span>
            <span className={styles.label}>Subject:</span>
            <span className={styles.value}>{request.subject}</span>
            <span className={styles.label}>Kid Name:</span>
            <span className={styles.value}>{request.name}</span>
            <span className={styles.label}>Language:</span>
            <span className={styles.value}>{request.language}</span>
            <button
              className={styles.unregisterButton}
              onClick={() =>
                unrespondMutation.mutate({ requestId: request.id })
              }
            >
              Unrespond
            </button>
          </div>
        ))}
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </div>
  );
}

export default PopupTutorView;
