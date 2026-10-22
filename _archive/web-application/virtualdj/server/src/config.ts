import { defaultScripts, type ScriptTemplates } from './scripts.js';

export interface VdjConnectionConfig {
   host: string;
   port: number;
   password: string;
   timeoutMs: number;
   /** Requests in flight at once; VirtualDJ's web server fails if you raise this too far. */
   maxConcurrent: number;
}

export interface MixConfig {
   leadSec: number;
   tailSec: number;
   /** How many song changes the overlap is measured over. 0 turns measuring off: lead/tail stay fixed. */
   history: number;
}

export interface Config {
   port: number;
   vdj: VdjConnectionConfig;
   /** How often the server samples VirtualDJ. It only detects events; the ticking clock runs in the browser. */
   pollMs: number;
   /** If the real position differs from what the browser clock would show by more than this, it is a seek. */
   seekToleranceSec: number;
   /** Consecutive failed polls before the UI is told VirtualDJ is gone. */
   maxFailures: number;
   /** Log clock events and failures to the console. */
   debug: boolean;
   /**
    * Automix does not play songs to the end: the next song fades in while the current one still has time left.
    * VirtualDJ cannot tell us the overlap, so it is measured at every song change (median of the last
    * `history` changes). These numbers are the starting guess, and the fixed value when `history` is 0.
    */
   mix: MixConfig;
   /** Automix list: retry delay after a failed read. */
   automixRetryMs: number;
   /** Automix list: periodic re-check in case songs were reordered without the count changing. */
   automixRecheckMs: number;
   fps: number;
   scripts: ScriptTemplates;
}

function envString(name: string, fallback: string): string {
   const raw = process.env[name];
   return raw === undefined || raw === '' ? fallback : raw;
}

function envNumber(name: string, fallback: number): number {
   const raw = process.env[name];
   if (raw === undefined || raw === '') return fallback;
   const value = Number(raw);
   if (!Number.isFinite(value)) throw new Error(`Environment variable ${name} must be a number, got "${raw}"`);
   return value;
}

function envFlag(name: string, fallback: boolean): boolean {
   const raw = process.env[name];
   if (raw === undefined || raw === '') return fallback;
   return !/^(0|false|off|no)$/i.test(raw);
}

export const config: Config = {
   port: envNumber('PORT', 3000),
   vdj: {
      host: envString('VDJ_HOST', '127.0.0.1'),
      port: envNumber('VDJ_PORT', 8081),
      password: envString('VDJ_PASSWORD', 'abcd@1234'),
      timeoutMs: 1500,
      maxConcurrent: 1,
   },
   pollMs: envNumber('POLL_MS', 500),
   seekToleranceSec: 2,
   maxFailures: 3,
   debug: envFlag('VDJ_DEBUG', true),
   mix: { leadSec: 0, tailSec: 0, history: 0 },
   automixRetryMs: 3000,
   automixRecheckMs: 30000,
   fps: 25,
   scripts: defaultScripts,
};
