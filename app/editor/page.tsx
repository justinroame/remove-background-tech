"use client";

import { Suspense } from "react";
import EditorContent from "./EditorContent";

export default function EditorPage() {
  return (
    <Suspense fallback={<div className="text-center p-20">Loading editor…</div>}>
      <EditorContent />
    </Suspense>
  );
}
