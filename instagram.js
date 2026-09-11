const INSTAGRAM_AUTH_URL =
  "https://www.instagram.com/oauth/authorize";
const INSTAGRAM_SCOPES = [
  "instagram_business_basic",
  "instagram_business_content_publish",
];
function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}
export function getAuthUrl() {
  const clientId = getRequiredEnv("INSTAGRAM_CLIENT_ID");
  const redirectUri = getRequiredEnv("INSTAGRAM_REDIRECT_URI");
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: INSTAGRAM_SCOPES.join(","),
  });
  return `${INSTAGRAM_AUTH_URL}?${params.toString()}`;
}
export async function handleCallback(code) {
  if (!code || typeof code !== "string") {
    throw new Error(
      "Instagram OAuth authorization code is required"
    );
  }
  const clientId = getRequiredEnv("INSTAGRAM_CLIENT_ID");
  const clientSecret = getRequiredEnv(
    "INSTAGRAM_CLIENT_SECRET"
  );
  const redirectUri = getRequiredEnv("INSTAGRAM_REDIRECT_URI");
  const response = await fetch(
    "https://api.instagram.com/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
        code,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(
      data.error_message ||
        data.error_type ||
        "Failed to exchange Instagram authorization code"
    );
  }
  return {
    accessToken: data.access_token,
    userId: data.user_id,
    tokenType: "Bearer",
  };
}
export async function getTrends() {
  return [];
}
export async function post(content) {
  if (!content) {
    throw new Error("Instagram post content is required");
  }
  throw new Error(
    "Instagram publishing requires a stored OAuth access token and media URL. The media publishing flow will be added after authentication storage is implemented."
  );
}
