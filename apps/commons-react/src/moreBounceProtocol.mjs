export const MORE_BOUNCE_ORIGIN = "https://michaelwave369.github.io";
export const BACKSPIN_URL = MORE_BOUNCE_ORIGIN + "/MoreBounceLabs/backspin.html";
export const XR_CHANNEL = "phi.commons.backspin-xr.v1";
export const XR_VERSION = 1;
export const COMMONS_VENUE_ID = "commons.venue.more-bounce.v1";

// This bridge is intentionally available only on the owner's same-origin
// GitHub Pages deployments. No remote file import or arbitrary execution.
export function mayConnectBooth(currentOrigin, boothOrigin = MORE_BOUNCE_ORIGIN) {
  return currentOrigin === MORE_BOUNCE_ORIGIN && boothOrigin === MORE_BOUNCE_ORIGIN;
}
/** @param {string} type @param {{ deck?: string, value?: number }} [payload] */
export function makeXRCommand(type, payload = {}) {
  const { deck, value } = payload;
  if (type === "hello" || type === "snapshot")
    return { channel: XR_CHANNEL, version: XR_VERSION, type };
  if ((type === "play" || type === "cue" || type === "release") && (deck === "A" || deck === "B"))
    return { channel: XR_CHANNEL, version: XR_VERSION, type, deck };
  if (type === "scratch" && (deck === "A" || deck === "B") && Number.isFinite(value) && typeof value === "number" && value >= -4 && value <= 4)
    return { channel: XR_CHANNEL, version: XR_VERSION, type, deck, value };
  if (type === "crossfade" && typeof value === "number" && Number.isFinite(value) && value >= -1 && value <= 1)
    return { channel: XR_CHANNEL, version: XR_VERSION, type, value };
  return null;
}
/** @param {string} origin @param {unknown} data */
export function validBoothReply(origin, data) {
  if (origin !== MORE_BOUNCE_ORIGIN || !data || typeof data !== "object" || Array.isArray(data)) return false;
  return data.channel === XR_CHANNEL && data.version === XR_VERSION && ["hello", "snapshot", "blocked"].includes(data.type);
}
