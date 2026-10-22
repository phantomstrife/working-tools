import type { AutomixSong, Cue } from '../protocol';

/** Played before we connected: keeps indexes aligned but has no details. */
export const isKnown = (song: AutomixSong | undefined): song is Extract<AutomixSong, { unknown: false }> =>
   song !== undefined && !song.unknown;

export const titleOf = (song: AutomixSong | undefined): string => (isKnown(song) ? song.title : '');

export const durationOf = (song: AutomixSong | undefined): number => (isKnown(song) ? song.duration : 0);

export const cuesOf = (song: AutomixSong | undefined): readonly Cue[] => (isKnown(song) ? song.cues : []);
