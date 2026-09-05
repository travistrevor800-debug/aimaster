# Connector Interface

Every file in this folder exports the same shape, so `social-sync/index.js`
can treat all platforms interchangeably:

```js
export function getAuthUrl() {}           // returns the OAuth URL to start the connect flow
export async function handleCallback(code) {}  // exchanges the OAuth code for tokens, stores them
export async function getTrends() {}      // returns [{ topic, platform, score, url }]
export async function post(content) {}    // publishes content, returns { success, postUrl }
```

## Platform notes (as of mid-2025 - verify current terms before building)

- **YouTube** - Data API v3. Uploads + trending video lists both supported.
  Easiest platform to get API approval for.
- **X (Twitter)** - API v2. Posting works on paid tiers. Trends endpoint
  exists but access has shifted around paid tiers - check current pricing.
- **Instagram / Facebook** - Meta Graph API. Requires a Business or Creator
  account and Meta App Review before you can post on a user's behalf.
  No public "trending topics" endpoint - you'll need a third-party trend
  source or manual curation.
- **TikTok** - Content Posting API exists but has a stricter approval
  process and posting quotas. No public trends API - same caveat as IG.

**Recommended build order:** YouTube and X first (lowest approval friction),
then Instagram/TikTok once you're ready to go through platform review.
Treat trend detection for IG/TikTok as a manual or third-party-fed input
until you have a reliable API source.
