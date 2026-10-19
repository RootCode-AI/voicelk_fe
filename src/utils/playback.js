import { getCookie, setCookie } from './cookies';

// Cookie holding the playback speed picked in Settings.
export const SPEED_COOKIE = 'vlk_playback_speed';

// The speed chosen during this visit. The cookie only remembers it across visits,
// and only with consent, so a guest or a visitor who declined cookies still gets
// the speed they picked until the page is closed.
let sessionSpeed = null;

export function getPlaybackSpeed() {
  return sessionSpeed || getCookie(SPEED_COOKIE) || '1.0';
}

export function savePlaybackSpeed(speed, persist) {
  sessionSpeed = speed;
  if (persist) setCookie(SPEED_COOKIE, speed);
}
