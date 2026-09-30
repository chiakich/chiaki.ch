# Generation prompts

`train-*.json` and `offtopic.json` were written by Claude subagents, one per file, from the
prompts below. `spec-N.json` comes from `npm run spec`, or `npm run spec:missing` for only the
rules no `train-N.json` covers yet (that is how `train-5.json` was made, with 22 lines for each
broad `visitor.*` category). The subagents were told not to read
`data/test/`, and `npm run prep` still drops any generated line identical to a test sentence.

## Paraphrases (`train-N.json`, one run per spec batch)

> You are generating training data for an intent router for a Traditional Chinese (Taiwan)
> role-play chatbot. The character is 八雲秋狐 (Akitsune), an artificial fox-eared girl who
> lives alone in a snowbound Shinto shrine (千秋稻荷社) after a strange war; visitors talk to
> her through a terminal line.
>
> Read ONLY `data/gen/spec-N.json`. It is an array of rules. Each has `id`, `requires` (flags
> that must already be set — i.e. the topic was already discussed earlier), `pattern_fragments`
> (what the current regex matches) and `her_replies` (what she says when the rule fires). Do
> not open anything under `data/test/`; it is a held-out test set.
>
> For EVERY rule, write 15 different things a visitor might type such that one of
> `her_replies` would be the right response. Requirements:
>
> - Taiwan Mandarin, Traditional characters, natural chat register. Mix 你 and 妳. Vary
>   length: some 2–5 characters, most 6–15, a few longer multi-clause ones. Vary form: direct
>   questions, 會不會/有沒有 forms, indirect statements, requests, colloquial particles
>   (欸、喔、啦、耶、嗎、齁). No emoji.
> - At most 3 of the 15 may reuse a `pattern_fragments` string verbatim; the rest must be
>   paraphrases the regex would plausibly miss.
> - Stay unambiguous. Mind the direction of feelings: sad / tired / scared / happy are the
>   VISITOR describing their own state (「我好累」); st.lonely / st.fear / st.dark / st.sleep /
>   st.like / st.cry are the visitor ASKING ABOUT HER (「妳會寂寞嗎」). 「你那邊」 means her
>   place, not the afterlife.
> - For rules with non-empty `requires`, write lines that make sense as a follow-up once that
>   topic has come up.
> - For conversational-glue rules (greeting, thanks, farewell, affirm, deny, sorry, …) write
>   the many ways people actually say those things.
>
> Write a single JSON object mapping rule id → array of 15 strings to `data/gen/train-N.json`,
> then validate it with node.

## Relabeled off-topic (`train-6.json`)

The first `offtopic.json` (200 lines of everyday chatter) went stale once the `visitor.*`
categories existed: a subagent reading every rule's replies found a fitting rule for all 200, so
they became paraphrases, grouped by that rule.

## Off-topic calibration (`offtopic.json`)

The current file asks for lines no rule fits, the `visitor.*` catch-alls included:

> Write 160 lines a real Taiwanese visitor might type where NO rule fits — the right behavior
> is for her to say she didn't quite follow or ask back. Check each against the rules and drop
> any that some rule's reply would answer sensibly: non sequiturs, half-finished or mis-sent
> fragments, references to things she couldn't know without context, statements about unnamed
> third parties, odd hypotheticals, abstract questions no rule covers. No keyboard mashing (a
> rule handles it). 3–25 characters, no emoji.

The original prompt, for reference:

> Read the four spec files to learn which topics ARE covered. Then write 200 things a real
> Taiwanese visitor might type into such a chat that NONE of those rules can sensibly answer:
> everyday life events, trivia, requests for tasks (coding, translation, homework,
> recommendations), current events, sports, tech support, opinions on unrelated subjects,
> local places and food, work/school chatter, non sequiturs. Traditional characters, 3–25
> characters, no emoji. Avoid anything a covered rule would reasonably handle. Write a JSON
> array to `data/gen/offtopic.json`.
