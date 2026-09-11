const YOUTUBE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const YOUTUBE_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
];
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
export function getAuthUrl() {
  const clientId = getRequiredEnv("YOUTUBE_CLIENT_ID");
  const redirectUri = getRequiredEnv("YOUTUBE_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    access_type: "offline",
    prompt: "consent",
    scope: YOUTUBE_SCOPES.join(" "),
  });
  return `${YOUTUBE_AUTH_URL}?${params.toString()}`;
}
export async function handleCallback(code) {
  if (!code || typeof code !== "string") {
    throw new Error("YouTube OAuth authorization code is required");
  }
  const clientId = getRequiredEnv("YOUTUBE_CLIENT_ID");
  const clientSecret = getRequiredEnv("YOUTUBE_CLIENT_SECRET");
  const redirectUri = getRequiredEnv("YOUTUBE_REDIRECT_URI");
  const response = await fetch(
    "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange YouTube authorization code"
    );
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresIn: data.expires_in || null,
    tokenType: data.token_type || "Bearer",
    scope: data.scope || YOUTUBE_SCOPES.join(" "),
  };
}
export async function getTrends() {
  return [];
}
export async function post(content) {
  if (!content) {
    throw new Error("YouTube post content is required");
  }
  throw new Error(
    "YouTube publishing requires a stored OAuth access token and video file. Token storage and video upload will be added next."
  );
}
