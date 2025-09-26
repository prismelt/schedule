"use client";

import { api } from "~/trpc/react";

function NextSession() {
  const [futureSessions] = api.schedule.getAllFuture.useSuspenseQuery();
  const nearestSession = futureSessions[0];
  return (
    <div>
      <h1>
        {nearestSession
          ? `Next Session at ${nearestSession.date.toISOString()}`
          : "No future sessions"}
      </h1>
    </div>
  );
}

export default NextSession;
