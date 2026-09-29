import sys
from sentence_transformers import SentenceTransformer
from train import OUT, export_onnx

for tag in sys.argv[1:]:
    export_onnx(SentenceTransformer(str(OUT / f"model-{tag}")), OUT / f"onnx-{tag}")
    print("exported", tag)
