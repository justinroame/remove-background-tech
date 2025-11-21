"use client";

import { Suspense } from "react";
import ResetPasswordInner from "./reset-form";

export const dynamic = "force-dynamic"; // ⬅ prevents static prerender

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading…</div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
