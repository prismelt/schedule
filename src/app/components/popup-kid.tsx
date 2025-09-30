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
    fulfillerId: string | null;
    partnerName: string | null;
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
  if (!request) {
    // show the create request page
    return (
      <div className={styles.overlay} onClick={onClose}>
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
        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Your Status:</span>
            <span className={`${styles.badge} ${styles.notRegistered}`}>
              No Request Created
            </span>
          </div>
        </div>
        <Link
          href={`/kid/post/${date.toLocaleDateString().replaceAll("/", "-")}`}
          className={styles.registerButton}
        >
          Create Request
        </Link>
      </div>
    );
  } else {
    // show the request page
    return (
      <div className={styles.overlay} onClick={onClose}>
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
        <div className={styles.status}>
          {request.fulfilled ? (
            <div className={styles.statusItem}>
              <span className={styles.label}>Your Status:</span>
              <span className={`${styles.badge} ${styles.registered}`}>
                Request Created And Fulfilled
              </span>
              <div className={styles.statusItem}>
                <span className={styles.label}>Partner:</span>
                <span className={`${styles.badge} ${styles.registered}`}>
                  {request.partnerName}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.statusItem}>
              <span className={styles.label}>Your Status:</span>
              <span className={`${styles.badge} ${styles.notRegistered}`}>
                Request Created, Waiting For Tutors to Response
              </span>
            </div>
          )}
        </div>
        <div className={styles.info}>
          <span className={styles.label}>Subject:</span>
          <span className={styles.value}>{request.subject}</span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.unregisterButton}
            onClick={() =>
              cancelRequestMutation.mutate({ requestId: request.id })
            }
          >
            Cancel Request
          </button>
        </div>
        <div>
          <Link
            href={`/kid/post/${date.toLocaleDateString().replaceAll("/", "-")}`}
            className={styles.registerButton}
          >
            Edit Request
          </Link>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    );
  }
}

export default PopupKid;
