/**
 * Extracts a human-readable message from a backend JSON error response.
 * Handles both this app's `{ error: string }` shape and NestJS's default
 * `{ message: string | string[] }` validation-error shape.
 */
export function getApiErrorMessage(json: unknown, fallback: string): string {
  if (json && typeof json === "object") {
    const body = json as { error?: unknown; message?: unknown };
    if (typeof body.error === "string" && body.error) return body.error;
    if (typeof body.message === "string" && body.message) return body.message;
    if (Array.isArray(body.message) && body.message.length) {
      return body.message.filter((m) => typeof m === "string").join(", ") || fallback;
    }
  }
  return fallback;
}
