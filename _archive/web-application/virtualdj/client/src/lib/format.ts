export const pad = (n: number, len = 2): string => String(Math.floor(n)).padStart(len, '0');

export const mmss = (seconds: number): string => {
   const s = Math.max(0, seconds);
   return `${pad(s / 60)}:${pad(s % 60)}`;
};

/** Countdown label: 83.2 -> "-01:24" (rounded up so it hits 00:00 exactly when time is up). */
export const countdown = (seconds: number): string => '-' + mmss(Math.ceil(seconds));

/** HH:MM:SS:FF */
export function timecode(totalSec: number, fps: number): string {
   const whole = Math.max(0, Math.floor(totalSec));
   const frames = Math.floor((Math.max(0, totalSec) - whole) * fps);
   return `${pad(whole / 3600)}:${pad((whole % 3600) / 60)}:${pad(whole % 60)}:${pad(frames)}`;
}
