"use client";

import styles from "~/styles/settings.module.css";
import { api } from "~/trpc/react";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import type { Language, UserType } from "~/server/db/schema";
import { languageEnum, userTypeEnum } from "~/server/db/schema";

function SettingsContent() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [newUsername, setNewUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const utils = api.useUtils();

  const setLanguageMutation = api.user.setLanguage.useMutation({
    onSuccess: () => {
      setSuccess("Language set successfully!");
      setError("");
      utils.user.getLanguage.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const setUserTypeMutation = api.user.setUserType.useMutation({
    onSuccess: () => {
      setSuccess("User type set successfully!");
      setError("");
      utils.user.getUserType.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" }).catch(() => {
      setError("Failed to sign out");
    });
  };

  const changeUsernameMutation = api.user.updateName.useMutation({
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

  const clearScheduleMutation = api.request.clear.useMutation({
    onSuccess: () => {
      setSuccess("All schedules cleared successfully!");
      setError("");
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const clearHelpRespondMutation = api.request.clearHelpRespond.useMutation({
    onSuccess: () => {
      setSuccess("All help requests cleared successfully!");
      setError("");
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const { data: userLanguage } = api.user.getLanguage.useQuery();
  const { data: userUserType } = api.user.getUserType.useQuery();

  return (
    <div className={styles.content}>
      {/* Back Button */}
      <section className={styles.section}>
        <Link href="/" className={styles.backButton}>
          ← Back to Calendar
        </Link>
        {error && <div className={styles.error}>{error}</div>}
        {success && <div className={styles.success}>{success}</div>}
      </section>

      {/* Language Management */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Partner Management</h2>
        {userLanguage ? (
          <h2 className={styles.sectionTitle}>Change Language</h2>
        ) : (
          <h2 className={styles.sectionTitle}> Set Language</h2>
        )}
        <div className={styles.inputGroup}>
          <select
            value={language ?? ""}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className={styles.input}
          >
            <option value="">Select a language</option>
            {Object.values(languageEnum.enumValues).map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          <button
            className={styles.primaryButton}
            onClick={() => setLanguageMutation.mutate({ language: language! })}
            disabled={setLanguageMutation.isPending || !language}
          >
            {setLanguageMutation.isPending ? "Setting..." : "Set Language"}
          </button>
        </div>
      </section>

      {/* User Type Management */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>User Type Management</h2>
        {userUserType ? (
          <h2 className={styles.sectionTitle}>Change User Type</h2>
        ) : (
          <h2 className={styles.sectionTitle}> Set User Type</h2>
        )}
        <div className={styles.inputGroup}>
          <select
            value={userType ?? ""}
            onChange={(e) => setUserType(e.target.value as UserType)}
            className={styles.input}
          >
            <option value="">Select a user type</option>
            {Object.values(userTypeEnum.enumValues).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            className={styles.primaryButton}
            onClick={() => setUserTypeMutation.mutate({ userType: userType! })}
            disabled={setUserTypeMutation.isPending || !userType}
          >
            {setUserTypeMutation.isPending ? "Setting..." : "Set User Type"}
          </button>
        </div>
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
            onClick={() =>
              changeUsernameMutation.mutate({ name: newUsername.trim() })
            }
            disabled={changeUsernameMutation.isPending || !newUsername.trim()}
          >
            {changeUsernameMutation.isPending
              ? "Changing..."
              : "Change Username"}
          </button>
        </div>
      </section>

      {/* Request Management */}
      {userUserType === "kid" ? (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Request Management</h2>
          <button
            className={styles.dangerButton}
            onClick={() => clearScheduleMutation.mutate()}
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
      ) : (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Request Management</h2>
          <button
            className={styles.dangerButton}
            onClick={() => clearHelpRespondMutation.mutate()}
            disabled={clearHelpRespondMutation.isPending}
          >
            {clearHelpRespondMutation.isPending
              ? "Clearing..."
              : "Clear All Help Requests"}
          </button>
          <p className={styles.warning}>
            This will permanently delete all your help requests responds.
          </p>
        </section>
      )}

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
