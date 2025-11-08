import os
import cv2
import torch
import torch.nn.functional as F
from torchvision import transforms, models
import numpy as np
import seaborn as sns
import matplotlib.pyplot as plt
from tqdm import tqdm
import itertools
from sklearn.metrics import roc_curve, auc
import pandas as pd

# -----------------------------
# 1️⃣ Device & Model
# -----------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"⚙️ Running on {DEVICE.upper()}")

_model = models.resnet34(weights=models.ResNet34_Weights.DEFAULT)
_model.fc = torch.nn.Identity()
_model = _model.to(DEVICE).eval()

_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])

# -----------------------------
# 2️⃣ Utility: Get Embedding
# -----------------------------
def get_embedding(path):
    img = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Cannot read {path}")
    img = cv2.resize(img, (224, 224))
    tensor = _transform(img).unsqueeze(0).repeat(1, 3, 1, 1).to(DEVICE)
    with torch.no_grad():
        emb = _model(tensor)
        emb = F.normalize(emb, dim=1)
    return emb.cpu().squeeze(0)

# -----------------------------
# 3️⃣ Load folder embeddings
# -----------------------------
def load_embeddings(folder):
    embeddings, names = [], []
    print(f"📂 Loading images from: {folder}")
    for f in tqdm(sorted(os.listdir(folder))):
        if f.lower().endswith((".png", ".jpg", ".jpeg", ".bmp")):
            path = os.path.join(folder, f)
            emb = get_embedding(path)
            embeddings.append(emb)
            names.append(f)
    return embeddings, names

# -----------------------------
# 4️⃣ Compute pairwise similarities
# -----------------------------
def compute_similarities(embeddings):
    n = len(embeddings)
    sims = []
    for i, j in itertools.combinations(range(n), 2):
        s = F.cosine_similarity(
            embeddings[i].unsqueeze(0), embeddings[j].unsqueeze(0)
        ).item()
        sims.append(s)
    return np.array(sims)

# -----------------------------
# 5️⃣ Analyze and visualize
# -----------------------------
def analyze_and_plot(same_sims, diff_sims, out_dir):
    mean_same, std_same = np.mean(same_sims), np.std(same_sims)
    mean_diff, std_diff = np.mean(diff_sims), np.std(diff_sims)
    min_same, min_diff = np.min(same_sims), np.min(diff_sims)
    max_same, max_diff = np.max(same_sims), np.max(diff_sims)

    # Optimal threshold (where same & diff overlap least)
    all_sims = np.concatenate([same_sims, diff_sims])
    y_true = np.concatenate([np.ones(len(same_sims)), np.zeros(len(diff_sims))])
    fpr, tpr, thresholds = roc_curve(y_true, all_sims)
    roc_auc = auc(fpr, tpr)
    optimal_idx = np.argmax(tpr - fpr)
    optimal_thresh = thresholds[optimal_idx]

    # Print summary
    print("\n🔍 Results Summary:")
    print(f"📊 Mean (Same Finger): {mean_same:.4f} ± {std_same:.4f}")
    print(f"📊 Mean (Different Finger): {mean_diff:.4f} ± {std_diff:.4f}")
    print(f"🔻 Min (Same): {min_same:.4f}, 🔺 Max (Diff): {max_diff:.4f}")
    print(f"⭐ Optimal Threshold: {optimal_thresh:.4f}")
    print(f"🎯 AUC Score: {roc_auc:.4f}")

    # Save numeric results
    pd.DataFrame({
        "Metric": [
            "Mean Same", "Std Same", "Min Same",
            "Mean Diff", "Std Diff", "Max Diff",
            "Optimal Threshold", "AUC"
        ],
        "Value": [
            mean_same, std_same, min_same,
            mean_diff, std_diff, max_diff,
            optimal_thresh, roc_auc
        ]
    }).to_csv(os.path.join(out_dir, "comparison_report.csv"), index=False)

    # Histogram comparison
    plt.figure(figsize=(7,5))
    sns.histplot(same_sims, color='green', kde=True, label='Same Finger', stat='density')
    sns.histplot(diff_sims, color='red', kde=True, label='Different Finger', stat='density')
    plt.axvline(optimal_thresh, color='blue', linestyle='--', label=f'Threshold={optimal_thresh:.4f}')
    plt.title("Fingerprint Similarity Distributions")
    plt.xlabel("Cosine Similarity")
    plt.ylabel("Density")
    plt.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "comparison_histogram.png"))
    plt.close()

    # ROC Curve
    plt.figure(figsize=(6,5))
    plt.plot(fpr, tpr, color='blue', lw=2, label=f"ROC (AUC={roc_auc:.4f})")
    plt.plot([0,1],[0,1],'k--')
    plt.xlabel("False Positive Rate")
    plt.ylabel("True Positive Rate")
    plt.title("ROC Curve (Same vs Different Finger)")
    plt.legend(loc="lower right")
    plt.tight_layout()
    plt.savefig(os.path.join(out_dir, "roc_curve.png"))
    plt.close()

    return optimal_thresh

# -----------------------------
# 6️⃣ Main Execution
# -----------------------------
if __name__ == "__main__":
    same_folder = "fingerprints_same"
    diff_folder = "fingerprints_diff"
    out_dir = "results"
    os.makedirs(out_dir, exist_ok=True)

    same_embs, _ = load_embeddings(same_folder)
    diff_embs, _ = load_embeddings(diff_folder)

    same_sims = compute_similarities(same_embs)
    diff_sims = compute_similarities(diff_embs)

    threshold = analyze_and_plot(same_sims, diff_sims, out_dir)

    print(f"\n✅ Final Combined Threshold: {threshold:.4f}")
    print(f"📁 All results saved to: {os.path.abspath(out_dir)}")
