"use client";

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: Record<string, unknown>;
};

export async function apiClient<T>(url: string, options: RequestOptions = {}) {
  const response = await fetch(url, {
    method: options.method ?? "GET",
    headers: { "Content-Type": "application/json" },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.error ?? "Falha ao processar requisição.");
  }

  return data as T;
}
