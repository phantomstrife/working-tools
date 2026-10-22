import { describe, expect, it } from 'vitest';
import { fill, num } from './script.js';

describe('fill', () => {
   it('replaces placeholders', () => {
      expect(fill("get_automix_song 'title' {i}", { i: 2 })).toBe("get_automix_song 'title' 2");
      expect(fill('cue_name {n} {n}', { n: 1 })).toBe('cue_name 1 1');
   });

   it('throws on a missing variable instead of sending "undefined" to VirtualDJ', () => {
      expect(() => fill('cue_name {n}', { i: 1 })).toThrow(/\{n\}/);
   });
});

describe('num', () => {
   it('parses plain numbers and decimal commas', () => {
      expect(num('12.5')).toBe(12.5);
      expect(num('12,5')).toBe(12.5);
      expect(num(7)).toBe(7);
   });

   it('parses mm:ss and hh:mm:ss', () => {
      expect(num('3:25')).toBe(205);
      expect(num('1:02:03')).toBe(3723);
   });

   it('returns 0 for errors and empty values', () => {
      expect(num('error:-2147467259')).toBe(0);
      expect(num('')).toBe(0);
      expect(num(null)).toBe(0);
      expect(num(undefined)).toBe(0);
      expect(num('abc')).toBe(0);
   });
});
