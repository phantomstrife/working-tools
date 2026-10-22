# VDJ Show Control

Live show display for VirtualDJ: current song, countdown, time left in the whole set, and the Automix list.

- `server/` — Node + Express + WebSocket, strict TypeScript. Polls VirtualDJ's web server and pushes **events** to the browser.
- `client/` — Vite + React + strict TypeScript. The ticking clock runs in the browser.

## Run it

```bash
npm run install:all          # once

# development (two terminals)
npm --prefix server run dev      # API + WebSocket on :3000
npm --prefix client run dev      # UI on :5173, proxies /api and /ws to :3000

# production (one process)
npm run build
npm --prefix server start        # serves the built UI too: http://localhost:3000
```

Other scripts: `npm run typecheck`, `npm test`, `npm run format`.

### Environment variables (server)

| Variable        | Default     | Meaning                                |
| --------------- | ----------- | -------------------------------------- |
| `PORT`          | `3000`      | Port of this app                       |
| `VDJ_HOST`      | `127.0.0.1` | VirtualDJ web server host              |
| `VDJ_PORT`      | `8081`      | VirtualDJ web server port              |
| `VDJ_PASSWORD`  | `abcd@1234` | VirtualDJ web server password          |
| `POLL_MS`       | `500`       | How often VirtualDJ is sampled         |
| `VDJ_DEBUG`     | on          | `0` / `false` silences the monitor log |
| `CLIENT_DIST`   | `../../client/dist` | Built UI folder, relative to `server/src` or `server/dist` |

Everything else (seek tolerance, Automix mix lead/tail, retry timings, fps) is in `server/src/config.ts`.
VirtualDJ commands are in `server/src/scripts.ts`.

## Layout

```
server/src
  protocol.ts         wire types shared with the client (types only)
  config.ts           typed config + env parsing
  scripts.ts          VirtualDJ script templates
  index.ts            Express, WebSocket, HTTP API
  messages.ts         typed emit/toMessage
  monitor/
    clock-math.ts     pure logic: project, classify, median (unit-tested)
    monitor.ts        polling loop, seek confirmation, overlap learning
  vdj/
    client.ts         queued HTTP client (high/low priority)
    script.ts         fill() and num()
    automix.ts        Automix list reader
    cues.ts           deck cues reader

client/src
  protocol.ts         `export type *` from the server's protocol.ts
  state/              reducer, provider, contexts
  hooks/              socket, clock ticker, live timing, row expansion
  lib/                Clock, formatting, timing maths, message parsing (unit-tested)
  components/         one small component per piece of UI
  strings.ts          all user-facing text
```

## How data flows

1. `monitor.ts` polls VirtualDJ and calls `emit('clock' | 'status' | 'automix', payload)` **only when something changes**.
2. `index.ts` sends each payload as `{ type, ...payload }` to every browser. A new browser first gets `monitor.snapshot()`.
3. The client parses it (`parseMessage.ts`), feeds `clock` messages to the `Clock`, and puts everything into the reducer.
4. `useClockTicker` reads the `Clock` on animation frames and only re-renders when the display frame changes. Only live widgets (countdown, timecode, the playing song row) subscribe to it.

## Extending

**New message from server to UI**

1. Add the payload to `ServerPayloads` in `server/src/protocol.ts`.
2. `emit('yourType', payload)` where it happens (and add it to `snapshot()` if late joiners need it).
3. Run `npm run typecheck`: the client fails to compile in `parseMessage.ts` and `showReducer.ts` until it handles the new type.

**New VirtualDJ command**

1. Add the key to `ScriptTemplates` and `defaultScripts` in `server/src/scripts.ts`.
2. Use `vdj.query(fill(scripts.yourKey, { i: 0 }))`. `fill` throws if a `{placeholder}` has no value.

**Cue feature**: `readDeckCues` already works (`GET /api/cues`) and `KnownSong.cues` is wired through the UI (tick marks, cue list, next-cue countdown). It needs the monitor to fill `cues` and a `clock`-style trigger to refresh them on track change.
