# Keiei Telegram bridge pattern research

## Bottom line
Keiei should stay on the official Pi runtime/session APIs, keep exactly one Telegram poll owner per bot, and treat images as structured prompt attachments. The lightest viable shape is: one controller owns `getUpdates`; any additional Pi processes register through an explicit coordination layer; session replacement uses Pi's runtime/session APIs, not raw JSONL surgery.

## Adopt

- **Official session control** — use `createAgentSessionRuntime`, `SessionManager`, and the replacement APIs (`newSession`, `switchSession`, `fork`, `reload`) instead of mutating session files or shelling out to `pi` from Telegram. Pi explicitly warns that captured extension ctx becomes stale after session replacement/reload, and the replacement callback must use the fresh ctx passed to `withSession`. Source: [Pi SDK](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sdk.md), [sessions](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/sessions.md), [session format](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/session-format.md), [session-runtime example](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/sdk/13-session-runtime.ts), [runtime footgun note](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/agent-session.ts).

- **Structured image input** — pass images through `PromptOptions.images` / `sendUserMessage([...text, image])`, and if an input transform rewrites text, preserve `event.images` instead of dropping them. Source: [RPC mode](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/rpc.md), [extensions API](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/extensions.md), [send-user-message example](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/send-user-message.ts), [inline-bash example](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/examples/extensions/inline-bash.ts), [agent session source](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/src/core/agent-session.ts).

- **Single-poller Telegram ownership** — use one `getUpdates` long-poll connection per bot. If Keiei spans multiple Pi processes, route through a single controller/leader and make workers register with it; do not let multiple processes poll the same bot token. Telegram's Bot API makes `getUpdates` and webhook modes mutually exclusive, and `@llblab/pi-telegram` says one bot has one poll loop and followers do not poll. Source: [Telegram Bot API](https://core.telegram.org/bots/api#getupdates), [Telegram Bot API getMe / topics fields](https://core.telegram.org/bots/api#getme), [pi-telegram updates](https://github.com/llblab/pi-telegram/blob/main/docs/updates.md), [pi-telegram multi-instance bus](https://github.com/llblab/pi-telegram/blob/main/docs/multi-instance-bus.md), [pi-telegram public API](https://github.com/llblab/pi-telegram/blob/main/docs/public-api.md).

- **Package boundaries** — publish Keiei as a `pi` package with a small public surface. Use `pi` manifest + conventional resource dirs, keep Pi libs in `peerDependencies`, and expose only public subpaths. Source: [Pi packages](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/packages.md), [pi-telegram package.json](https://github.com/llblab/pi-telegram/blob/main/package.json), [one-way pi-telegram package.json](https://github.com/dasomji/pi-telegram/blob/main/package.json).

## Avoid

- Multiple `getUpdates` owners for one bot token.
- Raw session JSONL editing as a control path.
- Turning the bridge into a full secretary/browser/cron/memory stack unless that becomes a separate product decision.
- Per-chat `--session-dir` subprocess farms as the core architecture.

## Public Telegram integrations

- **`@llblab/pi-telegram`** — best source for a lightweight multi-process pattern: one poller, follower routing, public API split, and clear boundaries between transport and extension surfaces. Good to copy: single owner, public `api/*` exports, `pi` manifest. Bad to copy: the whole thread/bus stack if Keiei does not need it.
- **`@wienerberliner/pi-telegram` / `pi-telegram`** — useful as a one-way notification sidecar, not as a bridge backbone. It proves the minimal env/CLI packaging shape and file-send helpers, but it intentionally has no inbound Telegram polling or session control.
- **`pi-telegram-manager`** — valuable for session-selection UX and mobile control ideas, but it is deliberately broad (personal/manager/mixed modes, memory, cron, browser, topic rotation). That is the opposite of "lightweight".
- **`Ziphyrien/Pi-Telegram`** — demonstrates per-chat `--session-dir` session isolation and cron jobs, but that is a different product shape from a single controller supervising existing Pi processes.

## Recommendations for Keiei

1. Keep exactly one Telegram poll owner and make all other Pi processes register behind it.
2. Use Pi's runtime/session APIs for replacement, resume, and fork flows; never mutate session files directly.
3. Preserve images as first-class prompt attachments end-to-end.
4. Keep the package surface tiny: one controller entrypoint, a small command surface, and public subpaths only.

## Risks / unknowns

- Whether Keiei needs Telegram private-chat topic/thread mode at all. If yes, it must probe Bot API topic capability (`getMe`, `message_thread_id`, `createForumTopic`) and carry a target abstraction.
- Whether multi-process coordination can stay a simple local registration bus or needs a full follower/leader design like `@llblab/pi-telegram`.
- Whether outbound files/attachments stay out of scope (the current plan suggests yes); if that changes, package surface and transport rules widen quickly.
