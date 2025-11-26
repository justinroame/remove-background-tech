"use client";

export const MAX_GUEST_UPLOADS = 5;
const KEY = "guest_upload_count";

export function getGuestUploadCount(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(KEY);
  return val ? parseInt(val) : 0;
}

export function incrementGuestUpload(): number {
  if (typeof window === "undefined") return 0;
  const next = getGuestUploadCount() + 1;
  localStorage.setItem(KEY, next.toString());
  return next;
}

export function resetGuestUploads() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
