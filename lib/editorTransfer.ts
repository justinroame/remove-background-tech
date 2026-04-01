"use client";

declare global {
  interface Window {
    __editor_image?: string;
    __editor_clean?: string;
  }
}

export function clearEditorTransfer() {
  if (typeof window === "undefined") return;
  window.__editor_image = undefined;
  window.__editor_clean = undefined;
}

export function setEditorTransfer(image: string, clean: string) {
  if (typeof window === "undefined") return;
  window.__editor_image = image;
  window.__editor_clean = clean;
}

export function getEditorClean(): string | null {
  if (typeof window === "undefined") return null;
  return window.__editor_clean ?? null;
}
