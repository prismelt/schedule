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
    fulfillerIdArray: string[];
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
                <div className={styles.requestHeader}>
                  Request You Responded To
                </div>

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
                  className={`${styles.button} ${styles.dangerButton}`}
                  onClick={() =>
                    unrespondMutation.mutate({ requestId: req.id })
                  }
                >
                  Unrespond
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

export default PopupTutorView;
