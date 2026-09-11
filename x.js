const X_AUTH_URL =
  "https://twitter.com/i/oauth2/authorize";
const X_TOKEN_URL =
  "https://api.x.com/2/oauth2/token";
const X_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "offline.access",
];
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
export function getAuthUrl() {
  const clientId = getRequiredEnv("X_CLIENT_ID");
  const redirectUri = getRequiredEnv("X_REDIRECT_URI");
  throw new Error(
    "X OAuth requires a per-user PKCE code verifier and challenge. Use the X OAuth flow before generating the authorization URL."
  );
}
export async function handleCallback(code) {
  if (!code || typeof code !== "string") {
    throw new Error(
      "X OAuth authorization code is required"
    );
  }
  const clientId = getRequiredEnv("X_CLIENT_ID");
  const redirectUri = getRequiredEnv("X_REDIRECT_URI");
  const codeVerifier = getRequiredEnv("X_CODE_VERIFIER");
  const response = await fetch(X_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      grant_type: "authorization_code",
      client_id: clientId,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange X authorization code"
    );
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in || null,
    tokenType: data.token_type || "Bearer",
    scope: data.scope || X_SCOPES.join(" "),
  };
}
export async function getTrends() {
  return [];
}
export async function post(content) {
  if (!content || typeof content !== "string") {
    throw new Error("X post content is required");
  }
  throw new Error(
    "X publishing requires a stored OAuth access token. Token storage will be added before publishing is enabled."
  );
}
