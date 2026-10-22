import type { Logger } from '../logger.js';
import type { AutomixPayload, AutomixSong, KnownSong, UnknownSong } from '../protocol.js';
import type { ScriptTemplates } from '../scripts.js';
import { errorMessage } from '../util.js';
import type { VdjClient } from './client.js';
import { fill, num } from './script.js';

export interface AutomixDeps {
   vdj: VdjClient;
   scripts: ScriptTemplates;
   log: Logger;
}

export const EMPTY_AUTOMIX: AutomixPayload = { count: 0, position: 0, songs: [] };

/** A field that fails (empty column...) becomes null instead of breaking the whole list. The failure is logged. */
const soft =
   (log: Logger) =>
   (promise: Promise<string>): Promise<string | null> =>
      promise.catch((error: unknown) => {
         log('query failed:', errorMessage(error));
         return null;
      });

const unknownSong = (offset: number): UnknownSong => ({ unknown: true, offset });

/** Read one song. `rel` is the index VirtualDJ understands, `offset` the song's absolute place in the list. */
async function readSong({ vdj, scripts, log }: AutomixDeps, rel: number, offset: number): Promise<KnownSong> {
   const read = (template: string) => soft(log)(vdj.query(fill(template, { i: rel })));
   const [path, artist, title, remix, length, key] = await Promise.all([
      read(scripts.automixPath),
      read(scripts.automixArtist),
      read(scripts.automixTitle),
      read(scripts.automixRemix),
      read(scripts.automixLength),
      read(scripts.automixKey),
   ]);

   log(`readAutomix: song #${offset} ${key} = ${path} ${title} (${artist}) [${length}s]`);
   // Without a title the row is useless: fail the read so it is retried instead of cached.
   if (title === null) throw new Error(`cannot read Automix song #${offset} (title)`);
   return {
      unknown: false,
      offset,
      path: path ?? '',
      artist: artist ?? '',
      title,
      remix: remix ?? '',
      duration: num(length),
      key: key ?? '',
      cues: [],
   };
}

/**
 * Read the Automix list.
 *
 * VirtualDJ's get_automix_song indexes RELATIVE to the playing song: index 0 is the song at `position`,
 * index 1 the next one, and songs that were already played can no longer be read (asking for them returns
 * an error). So we read only count - (position - 1) songs, and fill the played part of the list from the
 * previous read (same list) so past songs stay visible. Played songs we never saw come back as
 * `unknown: true` placeholders, which keep the indexes aligned and are not drawn by the UI.
 * `cues` is reserved for the upcoming cue feature.
 */
export async function readAutomix(
   deps: AutomixDeps,
   previous: AutomixPayload = EMPTY_AUTOMIX,
): Promise<AutomixPayload> {
   const { vdj, scripts, log } = deps;
   const [countRaw, positionRaw] = await Promise.all([
      soft(log)(vdj.query(scripts.automixCount)),
      soft(log)(vdj.query(scripts.automixPosition)),
   ]);
   const count = Math.max(0, Math.round(num(countRaw)));
   const position = Math.round(num(positionRaw));
   const played = Math.min(Math.max(position - 1, 0), count);

   // Requests are queued one at a time inside the client, so asking for all of them here is fine.
   const upcoming = await Promise.all(Array.from({ length: count - played }, (_, r) => readSong(deps, r, played + r)));

   const known = previous.count === count ? previous.songs : []; // same list as last time?
   const past = Array.from({ length: played }, (_, a): AutomixSong => {
      const earlier = known[a];
      return earlier && !earlier.unknown ? earlier : unknownSong(a);
   });
   return { count, position, songs: [...past, ...upcoming] };
}
