# VDJ Show Control

Path: `web-application/virtualdj`. Its own [README](../web-application/virtualdj/README.md) is the source of truth for setup, env vars and extension recipes. Summary:

- `server/` (Node, Express, WebSocket, strict TS) polls VirtualDJ's web server every `POLL_MS` (default 500 ms) and pushes events (`clock`, `status`, `automix`) only on change. New browsers receive `monitor.snapshot()` first.
- `client/` (Vite, React, strict TS) runs the ticking clock locally (`Clock`, `useClockTicker`), so the server does not stream every frame.
- `server/src/protocol.ts` is the single source of wire types; the client re-exports it (`export type *`). Adding a message type makes the client fail typechecking until handled in `parseMessage.ts` and `showReducer.ts`.
- Pure logic is unit tested (`clock-math`, `script`, `clock`, `format`, `timing`).

## Commands

```bash
npm run install:all
npm --prefix server run dev ; npm --prefix client run dev
npm run typecheck ; npm test ; npm run build ; npm run format
npm --prefix server start        # production: serves built UI on :3000
```

Default `VDJ_PASSWORD` is `abcd@1234`. Override it in real use.

