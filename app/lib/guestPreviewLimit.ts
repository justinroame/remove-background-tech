// lib/guestPreviewLimit.ts

export const MAX_GUEST_PREVIEW_DOWNLOADS = 3;
const KEY = "guest-preview-download-count";

export function getGuestPreviewDownloadCount(): number {
  if (typeof window === "undefined") return 0;
  const n = Number(localStorage.getItem(KEY) || "0");
  return Number.isFinite(n) ? n : 0;
}

export function incrementGuestPreviewDownloadCount(): number {
  if (typeof window === "undefined") return 0;
  const next = getGuestPreviewDownloadCount() + 1;
  localStorage.setItem(KEY, String(next));
  return next;
}

export function resetGuestPreviewDownloadCount() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
