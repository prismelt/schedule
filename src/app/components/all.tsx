"use client";

import { api } from "~/trpc/react";

function AllSessions() {
  const {
    data: allSessions,
    isLoading,
    error,
  } = api.schedule.getAll.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {allSessions?.map((session) => (
        <div key={session.id}>{session.date.toLocaleDateString("en-US")}</div>
      ))}
    </div>
  );
}

export default AllSessions;
