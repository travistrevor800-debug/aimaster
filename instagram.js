// instagram connector - STUB. See ./README.md for the interface contract
// and platform-specific notes before wiring up real credentials.

export function getAuthUrl() {
  // TODO: build the real OAuth authorize URL using your app's client ID,
  // redirect URI, and required scopes for instagram.
  return "TODO: implement getAuthUrl() for instagram";
}

export async function handleCallback(code) {
  // TODO: exchange "code" for an access/refresh token and persist it
  // (per-user) via the database module.
  throw new Error("handleCallback() not implemented for instagram");
}

export async function getTrends() {
  // TODO: call instagram's trends/analytics endpoint if one exists,
  // or a third-party trend source. See README.md for platform notes.
  return [];
}

export async function post(content) {
  // TODO: publish "content" to instagram on behalf of the connected user.
  throw new Error("post() not implemented for instagram");
}
