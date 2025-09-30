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

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
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

        <div className={styles.content}>
          <div className={styles.section}>
            {request.map((req) => (
              <div key={req.id} className={styles.requestItem}>
                <div className={styles.requestHeader}>Available Request</div>

                <div className={styles.requestDetails}>
                  <div className={styles.statusItem}>
                    <span className={styles.label}>Subject:</span>
                    <span className={styles.value}>{req.subject}</span>
                  </div>

                  <div className={styles.statusItem}>
                    <span className={styles.label}>Student Name:</span>
                    <span className={styles.value}>{req.name}</span>
                  </div>

                  <div className={styles.statusItem}>
                    <span className={styles.label}>Language:</span>
                    <span className={styles.value}>{req.language}</span>
                  </div>
                </div>

                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => respondMutation.mutate({ requestId: req.id })}
                >
                  Respond to Request
                </button>
              </div>
            ))}
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}
        </div>
      </div>
    </div>
  );
}

export default PopupTutorPost;
