const TIKTOK_AUTH_URL =
  "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL =
  "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_SCOPES = [
  "user.info.basic",
  "video.publish",
];
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
export function getAuthUrl() {
  const clientKey = getRequiredEnv("TIKTOK_CLIENT_KEY");
  const redirectUri = getRequiredEnv("TIKTOK_REDIRECT_URI");
  const params = new URLSearchParams({
    client_key: clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    redirect_uri: redirectUri,
  });
  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}
export async function handleCallback(code) {
  if (!code || typeof code !== "string") {
    throw new Error(
      "TikTok OAuth authorization code is required"
    );
  }
  const clientKey = getRequiredEnv("TIKTOK_CLIENT_KEY");
  const clientSecret = getRequiredEnv(
    "TIKTOK_CLIENT_SECRET"
  );
  const redirectUri = getRequiredEnv("TIKTOK_REDIRECT_URI");
  const response = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_key: clientKey,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });
  const data = await response.json();
  if (!response.ok || data.error) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to exchange TikTok authorization code"
    );
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    openId: data.open_id || null,
    expiresIn: data.expires_in || null,
    refreshExpiresIn: data.refresh_expires_in || null,
    tokenType: data.token_type || "Bearer",
    scope: data.scope || TIKTOK_SCOPES.join(","),
  };
}
export async function getTrends() {
  return [];
}
export async function post(content) {
  if (!content) {
    throw new Error("TikTok post content is required");
  }
  throw new Error(
    "TikTok publishing requires a stored OAuth access token and video or photo media. The Content Posting API media flow will be added after token storage is implemented."
  );
}
