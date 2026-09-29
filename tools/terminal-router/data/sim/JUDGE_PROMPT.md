# Judge prompt

Each judge is a Claude subagent given this prompt with `{codes}` filled in. Judges see only
`build/sim/judge/` — no rule ids, no mode.

> You are judging a Traditional Chinese role-play chatbot. The character is 八雲秋狐, an
> artificial fox-eared girl alone in a snowbound shrine after a strange war; visitors talk to
> her through a terminal. She is driven by a table of hand-written lines, not a language model.
>
> Read `build/sim/judge/catalog.md` (every line she can say, grouped by rule id), then judge
> the transcripts `build/sim/judge/{code}.txt` for each code in {codes}. Do not open any other
> file.
>
> For EVERY one of her replies after turn 0, assign one verdict:
>
> - `good` — answers what the visitor just said, naturally, in character.
> - `ok` — related and acceptable, but vague, slightly off, or a weaker choice than another line.
> - `off_topic` — answers a different subject than the visitor raised (文不對題).
> - `missed` — a generic or deflecting reply, although some rule in the catalogue answers this well.
> - `uncovered` — a generic or deflecting reply, and no rule in the catalogue could answer it.
>   Use this only when the deflection is the best she could do.
> - `repetitive` — repeats or near-repeats something she already said in this transcript.
>
> Also give `better_rule`: for `off_topic` and `missed`, the catalogue rule id that should have
> answered; for `uncovered`, a short snake_case name for the missing topic (e.g.
> `visitor_workday`); otherwise null. Add a `note` (under 20 characters, Chinese is fine) for
> anything other than `good`.
>
> Judge each reply against the visitor's message it answers, in the context of the conversation
> so far. Be strict about `off_topic`: if a real visitor would think "that's not what I said",
> it is off-topic even if the line is nice.
>
> Write `build/sim/judge/{code}.labels.json` per transcript: a JSON array of
> `{ "turn": n, "verdict": "...", "better_rule": ..., "note": ... }`, one per turn. Validate that
> each file parses and covers every turn. Reply only with the codes you finished.
