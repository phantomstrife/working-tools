import type { Cue } from '../protocol.js';
import type { ScriptTemplates } from '../scripts.js';
import type { VdjClient } from './client.js';
import { fill, num } from './script.js';

/**
 * Cues of the song on the master deck, positions in seconds. Exposed at GET /api/cues.
 * Not yet pushed to the UI (upcoming task). Cue numbering is assumed 1-based; verify against VirtualDJ.
 */
export async function readDeckCues(vdj: VdjClient, scripts: ScriptTemplates): Promise<Cue[]> {
   const count = Math.round(num(await vdj.query(scripts.cueCount)));
   const cues = await Promise.all(
      Array.from({ length: count }, async (_, k): Promise<Cue> => {
         const n = k + 1;
         const [name, posMs] = await Promise.all([
            vdj.query(fill(scripts.cueName, { n })),
            vdj.query(fill(scripts.cuePosMs, { n })),
         ]);
         return { n, name, pos: num(posMs) / 1000 };
      }),
   );
   return cues.sort((a, b) => a.pos - b.pos);
}
