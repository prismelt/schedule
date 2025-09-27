"use client";

import { api } from "~/trpc/react";

function NextSession() {
  const {
    data: futureSessions,
    isLoading,
    error,
  } = api.schedule.getAllFuture.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  const nearestSession = futureSessions?.[0];

  return (
    <div>
      {nearestSession ? (
        <div>
          Next session: {nearestSession.date.toLocaleDateString("en-US")}
        </div>
      ) : (
        <div>No upcoming sessions</div>
      )}
    </div>
  );
}

export default NextSession;
