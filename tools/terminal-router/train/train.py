# Fine-tunes bge-small-zh for rule routing and exports a transformers.js-compatible int8 ONNX model.
# Usage on the pod: python train.py  (expects data/ from `npm run prep` next to this file, writes out/)
import json
import random
import shutil
from pathlib import Path

import numpy as np
import torch
from datasets import Dataset
from sentence_transformers import SentenceTransformer, SentenceTransformerTrainer, SentenceTransformerTrainingArguments, losses
from sentence_transformers.losses import BatchHardTripletLossDistanceFunction
from sentence_transformers.training_args import BatchSamplers

BASE = "BAAI/bge-small-zh-v1.5"
ROOT = Path(__file__).parent
DATA, OUT = ROOT / "data", ROOT / "out"
random.seed(0)


def read_jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line.strip()]


train_rows = read_jsonl(DATA / "train.jsonl")
dev_rows = read_jsonl(DATA / "dev.jsonl")
offtopic_dev = json.loads((DATA / "offtopic_dev.json").read_text())
labels = sorted({r["label"] for r in train_rows})
label_id = {l: i for i, l in enumerate(labels)}
print(f"train {len(train_rows)}  dev {len(dev_rows)}  offtopic dev {len(offtopic_dev)}  rules {len(labels)}")


def evaluate(model, tag):
    enc = lambda texts: model.encode(texts, normalize_embeddings=True, batch_size=128, convert_to_numpy=True)
    proto = enc([r["text"] for r in train_rows])
    proto_label = np.array([label_id[r["label"]] for r in train_rows])

    def route(texts):
        sims = enc(texts) @ proto.T
        best = np.full((len(texts), len(labels)), -1.0)
        for li in range(len(labels)):
            best[:, li] = sims[:, proto_label == li].max(axis=1)
        order = np.argsort(-best, axis=1)
        top = best[np.arange(len(texts)), order[:, 0]]
        return order[:, 0], top

    pred, score = route([r["text"] for r in dev_rows])
    gold = np.array([label_id[r["label"]] for r in dev_rows])
    _, off_score = route(offtopic_dev)
    report = {"tag": tag, "dev_top1": float((pred == gold).mean()), "sweep": []}
    for tau in np.arange(0.5, 0.96, 0.025):
        hit = float(((pred == gold) & (score >= tau)).mean())
        wrong = float(((pred != gold) & (score >= tau)).mean())
        off_routed = float((off_score >= tau).mean())
        report["sweep"].append({"tau": round(float(tau), 3), "hit": hit, "wrong": wrong, "offtopic_routed": off_routed})
    print(f"[{tag}] dev top-1 {report['dev_top1']:.3f}")
    for s in report["sweep"]:
        print(f"  τ={s['tau']:.3f} hit {s['hit']:.3f} wrong {s['wrong']:.3f} off-topic routed {s['offtopic_routed']:.3f}")
    return report


def train_mnrl():
    # Pairs of two phrasings of the same rule; in-batch negatives do the rest.
    by_label = {}
    for r in train_rows:
        by_label.setdefault(r["label"], []).append(r["text"])
    pairs = []
    for texts in by_label.values():
        for t in texts:
            other = random.choice([x for x in texts if x != t] or texts)
            pairs.append({"anchor": t, "positive": other})
    random.shuffle(pairs)
    return Dataset.from_list(pairs), BatchSamplers.NO_DUPLICATES, lambda m: losses.MultipleNegativesRankingLoss(m)


def train_triplet():
    ds = Dataset.from_list([{"sentence": r["text"], "label": label_id[r["label"]]} for r in train_rows])
    return ds, BatchSamplers.GROUP_BY_LABEL, lambda m: losses.BatchAllTripletLoss(
        m, distance_metric=BatchHardTripletLossDistanceFunction.cosine_distance, margin=0.3
    )


def fit(tag, make, epochs, lr):
    model = SentenceTransformer(BASE, device="cuda" if torch.cuda.is_available() else "cpu")
    ds, sampler, loss = make()
    args = SentenceTransformerTrainingArguments(
        output_dir=str(OUT / f"ckpt-{tag}"),
        num_train_epochs=epochs,
        per_device_train_batch_size=64,
        learning_rate=lr,
        warmup_ratio=0.1,
        batch_sampler=sampler,
        save_strategy="no",
        logging_steps=20,
        report_to=[],
        seed=0,
    )
    SentenceTransformerTrainer(model=model, args=args, train_dataset=ds, loss=loss(model)).train()
    model.save(str(OUT / f"model-{tag}"))
    return model


def export_onnx(st_model, dest):
    # Same layout transformers.js expects from a Hub repo: config + tokenizer at the root, weights under onnx/.
    from onnxruntime.quantization import QuantType, quantize_dynamic

    dest.mkdir(parents=True, exist_ok=True)
    (dest / "onnx").mkdir(exist_ok=True)
    bert = st_model[0].auto_model.eval().cpu()
    tok = st_model.tokenizer

    # Keyword call: newer BertModel.forward no longer takes these positionally.
    class Wrapped(torch.nn.Module):
        def __init__(self):
            super().__init__()
            self.bert = bert

        def forward(self, input_ids, attention_mask, token_type_ids):
            return self.bert(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids).last_hidden_state

    sample = tok(["測試一下"], return_tensors="pt")
    names = ["input_ids", "attention_mask", "token_type_ids"]
    axes = {n: {0: "batch", 1: "sequence"} for n in names}
    axes["last_hidden_state"] = {0: "batch", 1: "sequence"}
    for param in bert.parameters():
        param.requires_grad_(False)
    with torch.no_grad():
        torch.onnx.export(
            Wrapped(),
            tuple(sample[n] for n in names),
            str(dest / "onnx" / "model.onnx"),
            input_names=names,
            output_names=["last_hidden_state"],
            dynamic_axes=axes,
            opset_version=17,
            dynamo=False,
        )
    quantize_dynamic(str(dest / "onnx" / "model.onnx"), str(dest / "onnx" / "model_int8.onnx"), weight_type=QuantType.QInt8)
    bert.config.save_pretrained(dest)
    tok.save_pretrained(dest)


if __name__ == "__main__":
    OUT.mkdir(exist_ok=True)
    reports = [evaluate(SentenceTransformer(BASE), "zero-shot")]
    variants = [
        ("mnrl", train_mnrl, 4, 3e-5),
        ("triplet", train_triplet, 4, 3e-5),
        ("mnrl-e10", train_mnrl, 10, 5e-5),
        ("triplet-e10", train_triplet, 10, 5e-5),
    ]
    for tag, make, epochs, lr in variants:
        reports.append(evaluate(fit(tag, make, epochs, lr), tag))
        shutil.rmtree(OUT / f"ckpt-{tag}", ignore_errors=True)
    (OUT / "dev-report.json").write_text(json.dumps(reports, indent=1))
    for tag, *_ in variants:
        export_onnx(SentenceTransformer(str(OUT / f"model-{tag}")), OUT / f"onnx-{tag}")
    print("done")
