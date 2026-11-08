/**
 * REEL House Rung 1. A presentation-only venue contract, not a broadcaster,
 * synchronized session service, or authorization to republish media.
 */
export const REEL_HOUSE_WORLD_ID = "commons.venue.reel-house.v1";
export const REEL_NETWORK_URL = "https://michaelwave369.github.io/ReelCommons/";
export const REEL_THEATER_URL = "https://michaelwave369.github.io/ReelTheater/";
export const DEMO_VIDEO_URL = "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";
export const MAX_LOCAL_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;
export const SEATS = Object.freeze(
  Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 5 }, (_, column) => Object.freeze({
      id: "row-" + (row + 1) + "-seat-" + (column + 1),
      label: "Row " + (row + 1) + ", seat " + (column + 1),
      x: (column - 2) * 1.65,
      z: row * 2.25 - 1.5
    }))
  ).flat()
);
export function seatById(id) {
  return SEATS.find(seat => seat.id === id) ?? null;
}
export function validateLocalVideo(file) {
  if (!file || typeof file !== "object") return "Choose a video file first.";
  if (!["video/mp4", "video/webm", "video/ogg"].includes(file.type))
    return "Choose a local MP4, WebM, or Ogg video.";
  if (!Number.isFinite(file.size) || file.size <= 0 || file.size > MAX_LOCAL_VIDEO_BYTES)
    return "Choose a non-empty video no larger than 2 GiB.";
  return null;
}
