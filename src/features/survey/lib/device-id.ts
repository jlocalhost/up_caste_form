import { DEVICE_ID_STORAGE_KEY } from "../constants";

export const DEVICE_ID_HEADER = "x-device-id";

function randomUuid(): string {
  // randomUUID needs a secure context (https/localhost); getRandomValues works everywhere.
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/**
 * Anonymous id for this browser, created on first use. It links submissions to the
 * device so "my submissions" works without accounts. Null if storage is unavailable.
 */
export function getDeviceId(): string | null {
  try {
    let id = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY);
    if (!id) {
      id = randomUuid();
      window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}
