import { describe, expect, it } from 'vitest';
import { countdown, mmss, timecode } from './format';

describe('format', () => {
   it('mmss clamps below zero', () => {
      expect(mmss(205)).toBe('03:25');
      expect(mmss(-5)).toBe('00:00');
   });

   it('countdown rounds up so it reaches 00:00 exactly when time is up', () => {
      expect(countdown(83.2)).toBe('-01:24');
      expect(countdown(0)).toBe('-00:00');
   });

   it('timecode shows frames', () => {
      expect(timecode(3661.5, 25)).toBe('01:01:01:12');
      expect(timecode(-1, 25)).toBe('00:00:00:00');
   });
});
