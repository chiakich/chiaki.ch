# Terminal router

Measures how well `/story/terminal` lands visitor input on the right rule, and trains a small
embedding model (`bge-small-zh-v1.5`, 23 MB int8 ONNX) to route topical input semantically
instead of by regex. Nothing here is loaded by the site yet.

## Layout

- `data/test/` — held-out test set: 515 hand-written paraphrases in 101 groups (`accept` lists
  every rule that would be a fair answer) plus 79 lines no rule fits. Never train on these.
- `data/gen/` — generated training data (`train-*.json`, 15 paraphrases per routable rule) and
  160 lines no rule fits, for threshold calibration. See `PROMPT.md` for how they were produced.
- `scripts/` — node scripts that drive the real engine from `lib/terminal/` through an esbuild
  bundle, so every number reflects the shipped matcher.
- `train/` — fine-tuning and ONNX export, meant to run on a GPU pod.

Only topical rules are routable. `continues` rules and empty input need turn context and stay
with regex, and rules without patterns (the name box's) are only ever jumped to (see
`scripts/protos.mjs`).

## Measure the regex engine

```sh
cd tools/terminal-router
npm install
npm run eval:regex
```

Prints hit / wrong-rule / fallback rates, the weakest rules, and every wrong-rule hit.

## Regenerate training data

When rules change, `npm run spec` writes `data/gen/spec-{1..4}.json` (`npm run spec:missing` only the uncovered rules); regenerate
`train-*.json` from them with the prompt in `data/gen/PROMPT.md`. Then:

```sh
npm run prep   # -> train/data/{train,dev}.jsonl, offtopic_dev.json
```

## Train on RunPod

```sh
runpodctl pod create --name akitsune-router --image runpod/pytorch:1.0.3-cu1281-torch291-ubuntu2404 \
  --gpu-id "NVIDIA GeForce RTX 4090" --ports 22/tcp
runpodctl ssh info <pod-id>   # host and port
scp -i ~/.runpod/ssh/runpodctl-ssh-key -P <port> -r train root@<host>:/root/
ssh -i ~/.runpod/ssh/runpodctl-ssh-key -p <port> root@<host>
# on the pod — the image's system python refuses pip (PEP 668), so use a venv on top of its torch
python -m venv --system-site-packages /root/venv
/root/venv/bin/pip install -r /root/train/requirements.txt
cd /root/train && /root/venv/bin/python train.py
```

`train.py` trains four variants (MNRL and batch-all triplet, 4 and 10 epochs; each takes
seconds on a 4090), prints a dev-set threshold sweep for each, and exports
`out/onnx-<variant>/` in the layout transformers.js expects. `export.py <variant>…` re-exports
saved models without retraining. Copy the int8 weights back and delete the pod:

```sh
ssh -i ~/.runpod/ssh/runpodctl-ssh-key -p <port> root@<host> \
  'cd /root/train/out && tar cf - --exclude=model.onnx onnx-*' | tar xf - -C models
runpodctl pod delete <pod-id>
```

A full run cost about USD 0.25.

## Evaluate a router

```sh
npm run eval:router                       # zero-shot base model, generated data as anchors
npm run eval:router -- onnx-mnrl-e10      # a model under models/
npm run eval:router -- onnx-mnrl-e10 patterns   # anchors from regex literals only
```

Thresholds are chosen on the dev split (objective: hit − 2 × wrong − off-topic routed) and
only then applied to the test set.

Results from the first run (2026-09-29):

| Router | Hit | Wrong rule | Fallback | Off-topic routed |
|---|---|---|---|---|
| regex | 61.3% | 11.0% | 27.7% | 16/40 |
| zero-shot, emb first, regex fallback | 73.4% | 9.0% | 17.5% | 17/40 |
| `onnx-mnrl-e10`, emb only (τ=0.71) | 77.7% | 5.9% | 16.4% | 6/40 |
| `onnx-mnrl-e10`, emb first, regex fallback | 83.9% | 8.8% | 7.3% | 18/40 |

Second run (2026-09-30), after 17 new rules and a harder test set (515 lines, 79 that no rule
fits, now that the `visitor.*` catch-alls answer everyday chatter):

| Router | Hit | Wrong rule | Fallback | Off-topic routed |
|---|---|---|---|---|
| regex | 54.4% | 11.7% | 34.0% | 9/79 |
| old `onnx-mnrl-e10`, emb first, regex fallback | 69.1% | 10.3% | 20.6% | 10/79 |
| `v2/onnx-mnrl-e10`, emb only (τ=0.80) | 48.0% | 1.7% | 50.3% | 0/79 |
| `v2/onnx-mnrl-e10`, emb first, regex fallback | 71.8% | 9.5% | 18.6% | 12/79 |

Its unthresholded top-1 on the test lines is 83.7%, so what holds it back is the threshold, not
the ranking: the dev split (generated paraphrases, one label each) scores far lower than the
test set, so thresholds tuned on it come out too strict.

The test sentences and the training data were both written by Claude, so treat these as
optimistic until they are checked against real visitor input (`persist.recordMiss`).

## Replay simulated visits through a router

```sh
node scripts/sim-replay.mjs regex 0 rx <id>...
node scripts/sim-replay.mjs v2/onnx-mnrl-e10 0.65 f65 --fill <id>...   # router only on regex misses
node scripts/sim-ab.mjs pack rx f65 <id>...   # then a blind judge writes labels.json
node scripts/sim-ab.mjs score rx f65
```

`score` reports turns the router answered apart from turns that differ only downstream (a
different line picked later, the name question landing elsewhere, or a recorded visitor answering
a question that only the other replay asked). Against regex alone (2026-09-30):

| Strategy | Visits | Router turns won / lost / tied | Bad replies on those turns |
|---|---|---|---|
| embedding first, regex fallback, τ=0.70 | 8 | 6 / 6 / 2 | 2 vs 4 |
| regex first, router fills misses, τ=0.65 | 8 | 6 / 1 / 1 | 0 vs 3 |
| fills misses and vetoes stray-keyword hits (`--fill --veto`), τ=0.65 | 16 | 11 / 4 / 0 | 2 vs 7 |

Embedding first overrides regex hits that turn context got right (「哪天」 after the war line, an
answer to her own question). On visitors who type full sentences, regex rarely misses outright;
it lands on the wrong rule because of one stray word (「那邊」, 「設計」), which is what the veto
catches: a regex hit whose rule scores under 0.3 against the input, when the router's pick scores
0.6 or more. That is the strategy to ship.
