# THROWAWAY PROTOTYPE — Telegram interaction contract

This text storyboard answers: what is the smallest Telegram interaction model that keeps connected Pi sessions clear and fast to operate on mobile?

**Verdict:** use a hybrid model: a compact, live session card for state and controls, plus ordinary chronological messages for routing acknowledgements, completions, failures, and requested recent output.

## Command surface

The BotFather command menu contains only:

- `/start` — show a brief introduction, then the chooser or selected-session card.
- `/sessions` — show the session chooser.
- `/status` — recreate the selected-session card; show the chooser if none is selected.
- `/help` — explain routing and these commands concisely.

An unknown `/command` is never forwarded to Pi. Keiei replies that the command is unknown and points to `/help`.

## Session identity

A session label combines:

1. Pi session name, when present;
2. working-directory basename;
3. textual state; and
4. a stable short identifier only when the preceding parts would collide.

Repeated parts are omitted. State icons supplement, but never replace, state text.

```text
○ docs · idle
◐ api-review · keiei · busy
◐ keiei · busy · a17c       # short id needed only to disambiguate
```

## Session chooser

```text
Connected sessions

● keiei · busy
○ docs · idle
○ api · idle

[ keiei · busy ]
[ docs · idle ]
[ api · idle ]
[ Refresh ]
```

Tapping a session selects it and replaces the chooser with its session card.

When exactly one session is connected and no session is selected, Keiei selects it automatically. When several are connected, ordinary input becomes pending until the user chooses its destination:

```text
Where should this be sent?

[ Send to keiei · busy ]
[ Send to docs · idle ]
[ Send to api · idle ]
[ Cancel ]
```

Choosing a destination both selects the session and sends the pending input. While input is pending, additional input is rejected with `Choose a session or cancel first.` Keiei never creates a hidden input queue.

With no connected sessions:

```text
No Pi sessions are connected.

On the computer, run:
/keiei connect
```

## Session card

Idle:

```text
○ docs · idle

[ Switch ] [ Recent ]
```

Busy:

```text
◐ keiei · busy

[ Switch ] [ Recent ]
[ Follow up next ] [ Abort ]
```

Unavailable controls are absent rather than disabled. Keiei keeps only the latest session card updated as that session changes state. `/status` recreates the card when it has become buried.

A stale callback does nothing and responds:

```text
This control is no longer available.
[ Current status ]
```

## Input routing

Ordinary text or image input targets the selected session:

- idle session → start a prompt;
- busy session → steer the current turn;
- follow-up mode armed → send one explicit follow-up.

Every accepted input gets a compact routing acknowledgement:

```text
↗ Prompt → docs
↪ Steer → keiei
⏳ Follow-up → keiei
📷 ↗ Prompt → docs
```

### Follow-up mode

`Follow up next` arms only the next text or image:

```text
Next input → follow-up for keiei
[ Cancel ]
```

The mode disarms after that input, cancellation, or a session switch.

### Abort

Abort requires confirmation:

```text
Abort keiei's current turn?
[ Abort ] [ Keep running ]
```

## Completion and failure notifications

Keiei notifies on every completion and failure, including work started locally and work from unselected sessions. It sends no separate started notification.

```text
✓ docs · 42s

Updated the installation guide…

[ Select ] [ Recent ]
```

```text
✕ api failed

<short available failure reason>

[ Select ] [ Recent ]
```

`Recent` inspects the notification's session without selecting it. Only `Select` changes the selected session.

Final assistant output is sent as plain text rather than Telegram rich-message streaming. Output that does not fit safely in one Telegram message is split into ordered chunks marked `(1/N)`, with the notification header on the first chunk and controls on the last.

## Recent output

`Recent` shows the newest user and assistant text from the session's active branch, oldest-first. It excludes tool calls and tool output, and includes only the newest content that fits in at most three Telegram messages. The MVP has no pagination.

```text
Recent · keiei

You
Run the focused tests.

Pi
The focused tests pass…
```

An image input appears as `[Image]` followed by its caption when present.

## Inbound images

Keiei accepts one Telegram photo or image document per message. The image is preserved as structured Pi input; its optional caption becomes the message text. A captionless image remains image-only.

Images follow the same prompt, steer, follow-up, pending-selection, and acknowledgement rules as text. Albums and non-image attachments are rejected with concise guidance instead of being partially processed.

## Explicitly absent from the MVP interaction

- token streaming and tool logs;
- outbound files or images;
- voice and general attachments;
- starting Pi sessions;
- model or thinking-level controls;
- session-history or branch manipulation;
- pagination and hidden message queues.
