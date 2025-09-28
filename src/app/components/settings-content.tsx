"use client";

import { api } from "~/trpc/react";
import { useState } from "react";
import styles from "../settings/settings.module.css";
import Link from "next/link";
import { signOut } from "next-auth/react";

function SettingsContent() {
  const [partnerName, setPartnerName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { data: hasPartner } = api.partner.hasPartner.useQuery();
  const { data: currentPartner } = api.partner.getPartner.useQuery();
  const utils = api.useUtils();

  const setPartnerMutation = api.partner.setPartner.useMutation({
    onSuccess: () => {
      setSuccess("Partner added successfully!");
      setError("");
      setPartnerName("");
      utils.partner.hasPartner.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
      utils.partner.getPartner.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const removePartnerMutation = api.partner.removePartner.useMutation({
    onSuccess: () => {
      setSuccess("Partner removed successfully!");
      setError("");
      utils.partner.hasPartner.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
      utils.partner.getPartner.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const clearScheduleMutation = api.schedule.clear.useMutation({
    onSuccess: () => {
      setSuccess("All schedules cleared successfully!");
      setError("");
      utils.schedule.getAllFuture.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const changeUsernameMutation = api.partner.changeUsername.useMutation({
    onSuccess: () => {
      setSuccess("Username changed successfully!");
      setError("");
      setNewUsername("");
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleSetPartner = () => {
    if (!partnerName.trim()) {
      setError("Please enter a partner name");
      return;
    }
    setPartnerMutation.mutate({ name: partnerName.trim() });
  };

  const handleRemovePartner = () => {
    removePartnerMutation.mutate();
  };

  const handleClearSchedule = () => {
    if (
      confirm(
        "Are you sure you want to clear all your schedules? This action cannot be undone.",
      )
    ) {
      clearScheduleMutation.mutate();
    }
  };

  const handleChangeUsername = () => {
    if (!newUsername.trim()) {
      setError("Please enter a new username");
      return;
    }
    changeUsernameMutation.mutate({ name: newUsername.trim() });
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" }).catch(() => {
      setError("Failed to sign out");
    });
  };

  return (
    <div className={styles.content}>
      <Link href="/" className={styles.backButton}>
        ← Back to Calendar
      </Link>
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {/* Partner Management */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Partner Management</h2>
        {hasPartner ? (
          <div className={styles.partnerInfo}>
            <p>
              Current partner: <strong>{currentPartner}</strong>
            </p>
            <button
              className={styles.dangerButton}
              onClick={handleRemovePartner}
              disabled={removePartnerMutation.isPending}
            >
              {removePartnerMutation.isPending
                ? "Removing..."
                : "Remove Partner"}
            </button>
          </div>
        ) : (
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter partner's username"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className={styles.input}
            />
            <button
              className={styles.primaryButton}
              onClick={handleSetPartner}
              disabled={setPartnerMutation.isPending}
            >
              {setPartnerMutation.isPending ? "Adding..." : "Add Partner"}
            </button>
          </div>
        )}
      </section>

      {/* Username Change */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Change Username</h2>
        <div className={styles.inputGroup}>
          <input
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className={styles.input}
          />
          <button
            className={styles.primaryButton}
            onClick={handleChangeUsername}
            disabled={changeUsernameMutation.isPending}
          >
            {changeUsernameMutation.isPending
              ? "Changing..."
              : "Change Username"}
          </button>
        </div>
      </section>

      {/* Schedule Management */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Schedule Management</h2>
        <button
          className={styles.dangerButton}
          onClick={handleClearSchedule}
          disabled={clearScheduleMutation.isPending}
        >
          {clearScheduleMutation.isPending
            ? "Clearing..."
            : "Clear All Schedules"}
        </button>
        <p className={styles.warning}>
          This will permanently delete all your scheduled dates.
        </p>
      </section>

      {/* Sign Out Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sign Out</h2>
        <button
          className={styles.signoutButton}
          onClick={() => handleSignOut()}
        >
          Sign Out
        </button>
      </section>
    </div>
  );
}

export default SettingsContent;
