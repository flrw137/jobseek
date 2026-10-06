import { createServerClient } from "@insforge/sdk/ssr";
import { cookies, headers } from "next/headers";

export async function createInsforgeServer() {
  const headerStore = await headers();
  const accessTokenOverride = headerStore.get("x-insforge-access-token");
  return createServerClient({
    cookies: await cookies(),
    ...(accessTokenOverride ? { accessToken: accessTokenOverride } : {}),
  });
}
