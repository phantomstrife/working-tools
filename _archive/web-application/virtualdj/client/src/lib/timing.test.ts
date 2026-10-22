import { describe, expect, it } from 'vitest';
import type { AutomixSong, Cue, KnownSong } from '../protocol';
import { cueStatus, mixOutAt, mixedLength, phaseOf, remainingAfter } from './timing';

const song = (offset: number, duration: number): KnownSong => ({
   unknown: false,
   offset,
   path: '',
   artist: '',
   title: `Song ${offset}`,
   remix: '',
   duration,
   key: '',
   cues: [],
});

const songs: AutomixSong[] = [{ unknown: true, offset: 0 }, song(1, 200), song(2, 180), song(3, 240)];
const mix = { leadSec: 10, tailSec: 20 };

describe('mixedLength', () => {
   it('subtracts lead and tail, except the tail of the last song', () => {
      expect(mixedLength(songs, 2, mix)).toBe(150);
      expect(mixedLength(songs, 3, mix)).toBe(230);
   });

   it('counts a placeholder song as zero', () => {
      expect(mixedLength(songs, 0, mix)).toBe(0);
   });
});

describe('remainingAfter', () => {
   it('sums what every later song adds to the set', () => {
      // song 1: 200-10-20=170, song 2: 180-10-20=150, song 3 (last): 240-10=230
      expect(remainingAfter(songs, mix)).toEqual([170 + 150 + 230, 150 + 230, 230, 0]);
   });

   it('returns an empty table for an empty list', () => {
      expect(remainingAfter([], mix)).toEqual([]);
   });
});

describe('mixOutAt', () => {
   it('stops before the tail when there is a next song, and plays the last song to the end', () => {
      expect(mixOutAt(200, true, mix)).toBe(180);
      expect(mixOutAt(200, false, mix)).toBe(200);
      expect(mixOutAt(0, true, mix)).toBe(0);
   });
});

describe('phaseOf', () => {
   it('labels songs relative to the playing one', () => {
      expect([0, 1, 2, 3, 4].map((i) => phaseOf(i, 2))).toEqual(['past', 'past', 'cur', 'next', 'fut']);
   });
});

describe('cueStatus', () => {
   const cues: Cue[] = [
      { n: 1, name: 'Intro', pos: 10 },
      { n: 2, name: 'Drop', pos: 60 },
   ];

   it('marks the cue the song is in and the ones already passed', () => {
      expect(cueStatus(cues, 0, 'cur', 30)).toEqual({ isNow: true, done: false });
      expect(cueStatus(cues, 0, 'cur', 70)).toEqual({ isNow: false, done: true });
      expect(cueStatus(cues, 1, 'cur', 30)).toEqual({ isNow: false, done: false });
   });

   it('treats every cue of a past song as done', () => {
      expect(cueStatus(cues, 1, 'past', 0).done).toBe(true);
      expect(cueStatus(cues, 1, 'next', 0)).toEqual({ isNow: false, done: false });
   });
});
