export type Logger = (...args: unknown[]) => void;

/** Timestamped console logger for one component. Returns a no-op when logging is turned off. */
export function createLogger(scope: string, enabled: boolean): Logger {
   if (!enabled) return () => undefined;
   return (...args) => console.log(new Date().toISOString().slice(11, 23), `[${scope}]`, ...args);
}
