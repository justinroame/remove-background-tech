import { cookies } from "next/headers";

export function getCurrentUserId() {
  const uid = cookies().get("uid")?.value;
  return uid ? Number(uid) : null;
}

export function requireUserId() {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Unauthorized");
  return uid;
}
