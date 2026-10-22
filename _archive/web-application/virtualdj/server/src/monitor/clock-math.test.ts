import { describe, expect, it } from 'vitest';
import { classify, median, project, trackIndexOf, type ClockAnchor } from './clock-math.js';

const anchor = (overrides: Partial<ClockAnchor> = {}): ClockAnchor => ({
   trackIndex: 0,
   title: 'Song A',
   elapsed: 10,
   duration: 200,
   playing: true,
   at: 1_000_000,
   ...overrides,
});

describe('project', () => {
   it('advances a playing anchor by the time passed', () => {
      expect(project(anchor(), 1_005_000)).toBeCloseTo(15);
   });

   it('keeps a paused anchor where it is', () => {
      expect(project(anchor({ playing: false }), 1_005_000)).toBe(10);
   });
});

describe('median', () => {
   it('handles odd, even and empty lists', () => {
      expect(median([3, 1, 2])).toBe(2);
      expect(median([4, 1, 2, 3])).toBe(2.5);
      expect(median([])).toBe(0);
   });
});

describe('trackIndexOf', () => {
   it('maps the 1-based Automix position to a 0-based index', () => {
      expect(trackIndexOf(3)).toBe(2);
      expect(trackIndexOf(0)).toBe(0);
   });
});

describe('classify', () => {
   it('asks for an anchor when there is none', () => {
      expect(classify(null, anchor(), 2)).toBe('init');
   });

   it('returns null while the browser clock is still right', () => {
      expect(classify(anchor(), anchor({ elapsed: 15, at: 1_005_000 }), 2)).toBeNull();
   });

   it('detects a track change by index or title', () => {
      expect(classify(anchor(), anchor({ trackIndex: 1 }), 2)).toBe('track');
      expect(classify(anchor(), anchor({ title: 'Song B' }), 2)).toBe('track');
   });

   it('detects play and pause', () => {
      expect(classify(anchor({ playing: false }), anchor({ playing: true }), 2)).toBe('play');
      expect(classify(anchor({ playing: true }), anchor({ playing: false }), 2)).toBe('pause');
   });

   it('detects a duration change', () => {
      expect(classify(anchor(), anchor({ duration: 201 }), 2)).toBe('duration');
   });

   it('detects a seek only beyond the tolerance', () => {
      expect(classify(anchor(), anchor({ elapsed: 11.5 }), 2)).toBeNull();
      expect(classify(anchor(), anchor({ elapsed: 60 }), 2)).toBe('seek');
   });

   it('lets a track change beat play/pause, and play/pause beat seek', () => {
      expect(classify(anchor({ playing: true }), anchor({ trackIndex: 1, playing: false }), 2)).toBe('track');
      expect(classify(anchor({ playing: true }), anchor({ playing: false, elapsed: 90 }), 2)).toBe('pause');
   });
});
