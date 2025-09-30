"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/day-modal.module.css";
import Link from "next/link";

interface PopupKidProps {
  date: Date;
  request: {
    id: number;
    date: Date;
    subject: string;
    fulfilled: boolean;
    fulfillerIdArray: string[];
    partnerNames: string[];
  } | null;
  onClose: () => void;
}

function PopupKid({ date, request, onClose }: PopupKidProps) {
  const [error, setError] = useState("");
  const utils = api.useUtils();

  const cancelRequestMutation = api.request.delete.useMutation({
    onSuccess: () => {
      utils.kidView.getAllFuture.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
      setTimeout(onClose, 1500);
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
          {!request ? (
            <>
              <div className={styles.section}>
                <div className={styles.statusItem}>
                  <span className={styles.label}>Your Status:</span>
                  <div className={`${styles.badge} ${styles.empty}`}>
                    No Request Created
                  </div>
                </div>
              </div>

              <div className={styles.actions}>
                <Link
                  href={`/kid/post/${date.toLocaleDateString().replaceAll("/", "-")}`}
                  className={`${styles.button} ${styles.primaryButton}`}
                >
                  Create Request
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.section}>
                <div className={styles.statusItem}>
                  <span className={styles.label}>Your Status:</span>
                  <div
                    className={`${styles.badge} ${request.fulfilled ? styles.fulfilled : styles.pending}`}
                  >
                    {request.fulfilled
                      ? "Request Fulfilled"
                      : "Waiting for Tutors"}
                  </div>
                </div>

                <div className={styles.statusItem}>
                  <span className={styles.label}>Subject:</span>
                  <span className={styles.value}>{request.subject}</span>
                </div>

                {request.fulfilled && request.partnerNames.length > 0 && (
                  <div className={styles.statusItem}>
                    <span className={styles.label}>Partner:</span>
                    <span className={styles.value}>
                      {request.partnerNames.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <Link
                  href={`/kid/post/${date.toLocaleDateString().replaceAll("/", "-")}`}
                  className={`${styles.button} ${styles.primaryButton}`}
                >
                  Edit Request
                </Link>

                <button
                  className={`${styles.button} ${styles.dangerButton}`}
                  onClick={() =>
                    cancelRequestMutation.mutate({ requestId: request.id })
                  }
                >
                  Cancel Request
                </button>
              </div>
            </>
          )}

          {error && <div className={styles.error}>{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default PopupKid;
