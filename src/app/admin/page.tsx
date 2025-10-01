"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import styles from "~/styles/admin.module.css";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const utils = api.useUtils();

  const { data: requestsData, refetch: refetchRequests } =
    api.admin.getAllRequests.useQuery(
      { password },
      { enabled: isAuthenticated },
    );

  const { data: users, refetch: refetchUsers } = api.admin.getAllUsers.useQuery(
    { password },
    { enabled: isAuthenticated },
  );

  const authenticateMutation = api.admin.authenticate.useMutation({
    onSuccess: () => {
      setIsAuthenticated(true);
      setError("");
    },
    onError: (error) => {
      setError(error.message);
    },
  });

  const deleteRequestMutation = api.admin.deleteRequest.useMutation({
    onSuccess: () => {
      setSuccess("Request deleted successfully");
      refetchRequests().catch(() => {
        setError("Failed to invalidate cache");
      });
      utils.admin.getAllRequests.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => setError(error.message),
  });

  const deleteUserMutation = api.admin.deleteUser.useMutation({
    onSuccess: () => {
      setSuccess("User deleted successfully");
      refetchUsers().catch(() => {
        setError("Failed to invalidate cache");
      });
      refetchRequests().catch(() => {
        setError("Failed to invalidate cache");
      });
      utils.admin.getAllUsers.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },

    onError: (error) => setError(error.message),
  });

  const deletePastRequestsMutation = api.admin.deletePastRequests.useMutation({
    onSuccess: () => {
      setSuccess("All past requests deleted successfully");
      refetchRequests().catch(() => {
        setError("Failed to invalidate cache");
      });
      utils.admin.getAllRequests.invalidate().catch(() => {
        setError("Failed to invalidate cache");
      });
    },
    onError: (error) => setError(error.message),
  });

  const handleLogin = () => {
    authenticateMutation.mutate({ password });
  };

  const handleDeleteRequest = (requestId: number) => {
    if (confirm("Are you sure you want to delete this request?")) {
      deleteRequestMutation.mutate({ password, requestId });
    }
  };

  const handleDeleteUser = (userId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this user? This will also delete all their requests.",
      )
    ) {
      deleteUserMutation.mutate({ password, userId });
    }
  };

  const handleDeletePastRequests = () => {
    if (confirm("Are you sure you want to delete all past requests?")) {
      deletePastRequestsMutation.mutate({ password });
    }
  };

  if (!isAuthenticated) {
    return (
      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <h1 className={styles.title}>Admin Login</h1>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.inputGroup}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
            />
            <button onClick={handleLogin} className={styles.button}>
              Login
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {success && <div className={styles.success}>{success}</div>}
        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Future Requests</h2>
          </div>
          <div className={styles.requestList}>
            {requestsData?.futureRequests.map((request) => (
              <div key={request.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <p>
                    <strong>Name:</strong> {request.name}
                  </p>
                  <p>
                    <strong>Subject:</strong> {request.subject}
                  </p>
                  <p>
                    <strong>Date:</strong> {request.date.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Tutors:</strong>{" "}
                    {request.fulfillerNames.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {request.fulfilled ? "Fulfilled" : "Pending"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Past Requests</h2>
            <button
              onClick={handleDeletePastRequests}
              className={styles.deleteAllButton}
            >
              Delete All Past Requests
            </button>
          </div>
          <div className={styles.requestList}>
            {requestsData?.pastRequests.map((request) => (
              <div key={request.id} className={styles.requestItem}>
                <div className={styles.requestInfo}>
                  <p>
                    <strong>Name:</strong> {request.name}
                  </p>
                  <p>
                    <strong>Subject:</strong> {request.subject}
                  </p>
                  <p>
                    <strong>Date:</strong> {request.date.toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Tutors:</strong>{" "}
                    {request.fulfillerNames.join(", ") || "None"}
                  </p>
                  <p>
                    <strong>Status:</strong>{" "}
                    {request.fulfilled ? "Fulfilled" : "Pending"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRequest(request.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <h2>All Users</h2>
          <div className={styles.userList}>
            {users?.map((user) => (
              <div key={user.id} className={styles.userItem}>
                <div className={styles.userInfo}>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Type:</strong> {user.userType ?? "Not set"}
                  </p>
                  <p>
                    <strong>Language:</strong> {user.language ?? "Not set"}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className={styles.deleteButton}
                >
                  Delete User
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
