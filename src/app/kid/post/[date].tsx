"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/post.module.css";
import { useSearchParams } from "next/navigation";

function PostPage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<"created" | "fulfilled" | "empty">(
    "empty",
  );
  const [requestId, setRequestId] = useState<number | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const utils = api.useUtils();

  useEffect(() => {
    const { data: request } = api.kidView.getRequest.useQuery(
      {
        date: date ?? "",
      },
      {
        enabled: !!date,
      },
    );
    const { data: partner } = api.user.getName.useQuery(
      {
        userId: request?.fulfillerId ?? "",
      },
      {
        enabled: !!request?.fulfillerId,
      },
    );
    if (!request) {
      setStatus("empty");
      return;
    }
    setStatus(request.fulfilled ? "fulfilled" : "created");
    setSubject(request.subject);
    setRequestId(request.id);
    setPartnerName(partner ?? null);
  }, [date]);

  const createRequestMutation = api.request.create.useMutation({
    onSuccess: () => {
      setSuccess("Request created successfully!");
      setError("");
      utils.kidView.getAllFuture.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const updateRequestMutation = api.request.update.useMutation({
    onSuccess: () => {
      setSuccess("Request updated successfully!");
      setError("");
      utils.kidView.getAllFuture.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const deleteRequestMutation = api.request.delete.useMutation({
    onSuccess: () => {
      setSuccess("Request deleted successfully!");
      setError("");
      utils.kidView.getAllFuture.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleCreateRequest = () => {
    createRequestMutation.mutate({ date: date!, subject });
  };

  const handleUpdateRequest = () => {
    if (!requestId) {
      setError("Request does not exist, cannot update the request");
      return;
    }
    updateRequestMutation.mutate({ requestId: requestId, subject });
  };

  const handleDeleteRequest = () => {
    if (!requestId) {
      setError("Request does not exist, cannot delete the request");
      return;
    }
    deleteRequestMutation.mutate({ requestId: requestId });
  };

  return (
    <div className={styles.container}>
      {status === "empty" ? (
        <h2 className={styles.title}>Create Request</h2>
      ) : (
        <h2 className={styles.title}>Edit Request</h2>
      )}
      {success && <div className={styles.success}>{success}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <input
          type="text"
          placeholder="Enter subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={styles.input}
        />
        <button
          className={styles.primaryButton}
          onClick={
            status === "empty" ? handleCreateRequest : handleUpdateRequest
          }
          disabled={
            createRequestMutation.isPending ||
            updateRequestMutation.isPending ||
            !subject.trim()
          }
        >
          {createRequestMutation.isPending || updateRequestMutation.isPending
            ? "Creating..."
            : status === "empty"
              ? "Create Request"
              : "Update Request"}
        </button>
      </div>

      {status !== "empty" && (
        <div className={styles.info}>
          <span className={styles.label}>Subject:</span>
          <span className={styles.value}>{subject}</span>
          <span className={styles.label}>Status:</span>
          {status === "created" ? (
            <span className={styles.value}>Waiting for tutors to respond</span>
          ) : (
            <>
              <span className={styles.value}>Fulfilled by</span>
              <span className={styles.value}>{partnerName}</span>
            </>
          )}
        </div>
      )}
      {status !== "empty" && (
        <button
          className={styles.dangerButton}
          onClick={handleDeleteRequest}
          disabled={deleteRequestMutation.isPending}
        >
          {deleteRequestMutation.isPending ? "Deleting..." : "Delete Request"}
        </button>
      )}
    </div>
  );
}

export default PostPage;
