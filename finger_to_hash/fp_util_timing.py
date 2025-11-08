import os, time, csv, torch
from statistics import mean, stdev
from fp_utils import (  # <-- rename to your actual utils filename
    get_fingerprint_embedding,
    compare_fingerprints,
    embedding_to_sha256,
    image_to_fingerprint_hash,
)

# ---------------------- CONFIG ----------------------
IMG_PATH = r"D:\coding\v0-zk-proof-identity-portal\finger_to_hash\demo_finger\100__M_Left_index_finger.bmp"
TEST_CODE = "bx19D0"
TRIALS = 5
OUT_DIR = "results"
os.makedirs(OUT_DIR, exist_ok=True)
RESULTS_FILE = os.path.join(OUT_DIR, "timing_report.csv")
# ----------------------------------------------------

def timed_call(func, *args):
    start = time.perf_counter()
    result = func(*args)
    end = time.perf_counter()
    return result, (end - start) * 1000  # ms

timings = {"embedding": [], "compare": [], "hash": [], "pipeline": []}

print("⏱ Benchmarking full fingerprint authentication pipeline\n")

for i in range(TRIALS):
    print(f"=== Trial {i+1}/{TRIALS} ===")

    emb, t1 = timed_call(get_fingerprint_embedding, IMG_PATH)
    timings["embedding"].append(t1)
    print(f"  [1] Embedding extraction      : {t1:8.2f} ms")

    sim, t2 = timed_call(compare_fingerprints, IMG_PATH, emb)
    timings["compare"].append(t2)
    print(f"  [2] Cosine similarity (self)  : {t2:8.2f} ms  (sim={sim:.4f})")

    _, t3 = timed_call(embedding_to_sha256, emb, TEST_CODE)
    timings["hash"].append(t3)
    print(f"  [3] Hash generation (HMAC256) : {t3:8.3f} ms")

    _, t4 = timed_call(image_to_fingerprint_hash, IMG_PATH, TEST_CODE)
    timings["pipeline"].append(t4)
    print(f"  [4] End-to-End pipeline       : {t4:8.2f} ms\n")

# --- summary ---
def avg_sd(x): return mean(x), stdev(x)

summary = {k: avg_sd(v) for k, v in timings.items()}

print("=== Aggregate Results (ms) ===")
for k, (avg, sd) in summary.items():
    print(f"{k.capitalize():<15} → {avg:8.2f} ± {sd:5.2f}")

with open(RESULTS_FILE, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["Step", "Mean (ms)", "StdDev (ms)", "Trials"])
    for k, (avg, sd) in summary.items():
        w.writerow([k, f"{avg:.2f}", f"{sd:.2f}", TRIALS])

print(f"\n✅ Timing results saved to {RESULTS_FILE}")
