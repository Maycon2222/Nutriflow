"use client";

import { useState } from "react";

export function useRequestStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  return {
    loading,
    error,
    success,
    setLoading,
    setError,
    setSuccess,
    resetMessages,
  };
}
