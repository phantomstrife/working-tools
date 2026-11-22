export const CLIENT_APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '0.0.0';
export const CLIENT_APP_BUILD_ID = process.env.NEXT_PUBLIC_APP_BUILD_ID || '';
export const VERSION_API_ENDPOINT = '/api/app-version';
export const FOCUS_CHECK_THROTTLE_MS = 30_000;
export const BACKGROUND_CHECK_INTERVAL_MS = 5 * 60 * 1000;
