import { cookies } from "next/headers";

export interface SimpleUser {
  name: string;
  slackId: string;
}

const COOKIE_NAME = "flea-market-user";

export async function getUser(): Promise<SimpleUser | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.value)) as SimpleUser;
  } catch {
    return null;
  }
}
