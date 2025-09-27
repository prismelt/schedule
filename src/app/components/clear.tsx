"use client";

import { api } from "~/trpc/react";

function ClearAllSessions() {
  const clearMutation = api.schedule.clear.useMutation();
  const handleClear = () => {
    clearMutation.mutate();
  };

  return (
    <button
      type="button"
      onClick={handleClear}
      disabled={clearMutation.isPending}
    >
      {clearMutation.isPending ? "Clearing..." : "Clear All Sessions"}
    </button>
  );
}

export default ClearAllSessions;
