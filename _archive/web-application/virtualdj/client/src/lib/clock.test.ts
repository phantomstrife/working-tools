import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Clock } from './clock';

let nowMs = 0;

beforeEach(() => {
   nowMs = 0;
   vi.spyOn(performance, 'now').mockImplementation(() => nowMs);
});

afterEach(() => {
   vi.restoreAllMocks();
});

const anchor = (elapsed: number, reason: 'track' | 'seek' | 'play' | 'pause' = 'track', playing = true) => ({
   elapsed,
   duration: 100,
   playing,
   reason,
});

describe('Clock', () => {
   it('advances by itself while playing and stays put while paused', () => {
      const clock = new Clock();
      clock.sync(anchor(10));
      nowMs = 5_000;
      expect(clock.now()).toBeCloseTo(15);

      clock.sync(anchor(15, 'pause', false));
      nowMs = 9_000;
      expect(clock.now()).toBeCloseTo(15);
   });

   it('ignores small corrections while playing but applies large ones', () => {
      const clock = new Clock();
      clock.sync(anchor(10));
      nowMs = 5_000;

      clock.sync(anchor(15.4, 'seek'));
      expect(clock.now()).toBeCloseTo(15);

      clock.sync(anchor(40, 'seek'));
      expect(clock.now()).toBeCloseTo(40);
   });

   it('always re-anchors on a track change, even for a small difference', () => {
      const clock = new Clock();
      clock.sync(anchor(10));
      nowMs = 5_000;
      clock.sync(anchor(15.4, 'track'));
      expect(clock.now()).toBeCloseTo(15.4);
   });

   it('freezes while suspended and resumes from the frozen value', () => {
      const clock = new Clock();
      clock.sync(anchor(10));
      nowMs = 5_000;
      clock.setSuspended(true);
      nowMs = 20_000;
      expect(clock.now()).toBeCloseTo(15);

      clock.setSuspended(false);
      nowMs = 22_000;
      expect(clock.now()).toBeCloseTo(17);
   });

   it('never runs past the song length', () => {
      const clock = new Clock();
      clock.sync(anchor(99));
      nowMs = 10_000;
      expect(clock.now()).toBe(100);
   });
});
