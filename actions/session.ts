"use server";

import { createInsforgeServer } from "@/lib/insforge-server";

export async function getSessionUser() {
  const insforge = await createInsforgeServer();
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error || !data?.user) {
    return { user: null, error: error?.message ?? null };
  }
  return { user: data.user, error: null };
}
