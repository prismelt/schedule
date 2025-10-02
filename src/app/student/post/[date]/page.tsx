"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/post.module.css";
import { redirect } from "next/navigation";
import Navigation from "~/app/components/navigation";

function PostPage({ params }: { params: Promise<{ date: string }> }) {
  const [date, setDate] = useState<string>("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<"created" | "fulfilled" | "empty">(
    "empty",
  );
  const [requestId, setRequestId] = useState<number | null>(null);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const utils = api.useUtils();

  // Move hooks to top level
  const { data: request } = api.kidView.getRequest.useQuery(
    { date: date ?? "" },
    { enabled: !!date },
  );

  const { data: partner } = api.user.getNameArray.useQuery(
    { userId: request?.fulfillerIdArray ?? [] },
    { enabled: !!request?.fulfillerIdArray },
  );

  useEffect(() => {
    void params
      .then(({ date: paramDate }) => {
        setDate(paramDate);
      })
      .catch((error) => {
        setError(`Failed to load date parameter: ${error}`);
      });
  }, [params]);

  // Update state when request or partner data changes
  useEffect(() => {
    if (!request) {
      setStatus("empty");
      setSubject("");
      setRequestId(null);
      setPartnerName(null);
      return;
    }
    setStatus(request.fulfilled ? "fulfilled" : "created");
    setSubject(request.subject);
    setRequestId(request.id);
    setPartnerName(partner?.join(", ") ?? null);
  }, [request, partner]);

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
      redirect("/kid/view");
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
      redirect("/kid/view");
    },
    onError: (error) => {
      setError(error.message);
      setSuccess("");
    },
  });

  const handleCreateRequest = () => {
    createRequestMutation.mutate({
      date: new Date(Date.parse(date)).toISOString(),
      subject,
    });
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
    <main className={styles.main}>
      <Navigation />
      <br></br>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {status === "empty" ? "Create Request" : "Edit Request"}
        </h2>

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
              ? "Processing..."
              : status === "empty"
                ? "Create Request"
                : "Update Request"}
          </button>
        </div>

        {status !== "empty" && (
          <div className={styles.info}>
            <div className={styles.infoRow}>
              <span className={styles.label}>Subject:</span>
              <span className={styles.value}>{subject}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Status:</span>
              {status === "created" ? (
                <span className={styles.statusPending}>
                  Waiting for tutors to respond
                </span>
              ) : (
                <div className={styles.statusFulfilled}>
                  <span className={styles.statusText}>Fulfilled by</span>
                  <span className={styles.partnerName}>{partnerName}</span>
                </div>
              )}
            </div>
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
    </main>
  );
}

export default PostPage;
