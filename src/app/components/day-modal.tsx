"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import styles from "./day-modal.module.css";

interface DayModalProps {
  date: Date;
  isRegistered: boolean;
  partnerIsRegistered: boolean;
  onClose: () => void;
}

function DayModal({
  date,
  isRegistered,
  partnerIsRegistered,
  onClose,
}: DayModalProps) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const utils = api.useUtils();

  const registerMutation = api.schedule.register.useMutation({
    onSuccess: () => {
      setSuccess("Successfully registered!");
      setError("");
      utils.schedule.getAll.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
      setTimeout(onClose, 1500);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const unregisterMutation = api.schedule.unregister.useMutation({
    onSuccess: () => {
      setSuccess("Successfully unregistered!");
      setError("");
      utils.schedule.getAll.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
      setTimeout(onClose, 1500);
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleRegister = () => {
    const dateString = date.toISOString().split("T")[0];
    if (!dateString) {
      setError("Invalid date");
      return;
    }
    registerMutation.mutate({ date: dateString });
  };

  const handleUnregister = () => {
    const dateString = date.toISOString().split("T")[0];
    if (!dateString) {
      setError("Invalid date");
      return;
    }
    unregisterMutation.mutate({ date: dateString });
  };

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

        <div className={styles.status}>
          <div className={styles.statusItem}>
            <span className={styles.label}>Your Status:</span>
            <span
              className={`${styles.badge} ${isRegistered ? styles.registered : styles.notRegistered}`}
            >
              {isRegistered ? "Registered" : "Not Registered"}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.label}>Partner Status:</span>
            <span
              className={`${styles.badge} ${partnerIsRegistered ? styles.registered : styles.notRegistered}`}
            >
              {partnerIsRegistered ? "Registered" : "Not Registered"}
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          {isRegistered ? (
            <button
              className={styles.unregisterButton}
              onClick={handleUnregister}
              disabled={unregisterMutation.isPending}
            >
              {unregisterMutation.isPending ? "Unregistering..." : "Unregister"}
            </button>
          ) : (
            <button
              className={styles.registerButton}
              onClick={handleRegister}
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Registering..." : "Register"}
            </button>
          )}
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </div>
    </div>
  );
}

export default DayModal;
