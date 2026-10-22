// HTTP client for the VirtualDJ remote API.
//
// VirtualDJ's built-in web server copes badly with many simultaneous requests (it answers
// "error:-2147467259" etc.), so every call goes through a queue. `high` priority jobs (clock polling)
// always jump ahead of `low` ones (reading the Automix list), so a long list read can't delay the clock.

import type { VdjConnectionConfig } from '../config.js';

export type Priority = 'high' | 'low';
type RequestKind = 'query' | 'execute';

export interface VdjReading {
   text: string;
   /** Epoch ms of the middle of the real round trip (not the queue wait): when the value was most likely read. */
   at: number;
}

export interface VdjClient {
   query(script: string, priority?: Priority): Promise<string>;
   /** Like query, but also returns the epoch ms the value was read. */
   queryAt(script: string, priority?: Priority): Promise<VdjReading>;
   exec(script: string, priority?: Priority): Promise<string>;
}

interface Job {
   kind: RequestKind;
   script: string;
   resolve: (reading: VdjReading) => void;
   reject: (reason: unknown) => void;
}

export function createVdj({ host, port, password, timeoutMs, maxConcurrent }: VdjConnectionConfig): VdjClient {
   async function request(kind: RequestKind, script: string): Promise<VdjReading> {
      const url = `http://${host}:${port}/${kind}?script=${encodeURIComponent(script)}`;
      const sentAt = Date.now();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
         const res = await fetch(url, {
            headers: password ? { Authorization: `Bearer ${password}` } : {},
            signal: controller.signal,
         });
         if (!res.ok) throw new Error(`HTTP ${res.status}`);
         const text = (await res.text()).trim();
         // VirtualDJ reports script failures as normal 200 responses with text like "error:-2147467259"
         if (/^error\b/i.test(text)) throw new Error(`${text} (script: ${script})`);
         return { text, at: (sentAt + Date.now()) / 2 };
      } finally {
         clearTimeout(timer);
      }
   }

   const queues: Record<Priority, Job[]> = { high: [], low: [] };
   let active = 0;

   function pump(): void {
      while (active < maxConcurrent) {
         const job = queues.high.shift() ?? queues.low.shift();
         if (!job) return;
         active++;
         request(job.kind, job.script)
            .then(job.resolve, job.reject)
            .finally(() => {
               active--;
               pump();
            });
      }
   }

   function enqueue(kind: RequestKind, script: string, priority: Priority = 'low'): Promise<VdjReading> {
      return new Promise((resolve, reject) => {
         queues[priority].push({ kind, script, resolve, reject });
         pump();
      });
   }

   return {
      query: async (script, priority) => (await enqueue('query', script, priority)).text,
      queryAt: (script, priority) => enqueue('query', script, priority),
      exec: async (script, priority) => (await enqueue('execute', script, priority)).text,
   };
}
