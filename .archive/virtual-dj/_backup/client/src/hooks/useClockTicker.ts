import { useEffect, useState } from 'react';
import type { Clock } from '../lib/clock';

/**
 * Song position in seconds, refreshed on animation frames but only committed when the display frame
 * (1/fps) changes. While paused the value never changes, so nothing re-renders.
 */
export function useClockTicker(clock: Clock, fps: number): number {
   const [elapsed, setElapsed] = useState(() => clock.now());

   useEffect(() => {
      let raf = 0;
      let lastFrame = -1;
      const loop = (perf: number): void => {
         const t = clock.now(perf);
         const frame = Math.floor(t * fps);
         if (frame !== lastFrame) {
            lastFrame = frame;
            setElapsed(t);
         }
         raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
      return () => cancelAnimationFrame(raf);
   }, [clock, fps]);

   return elapsed;
}
