import os
import torch
import numpy as np
import matplotlib.pyplot as plt
from finger_to_hash.fp_utils import get_fingerprint_embedding

# -----------------------------
# CONFIG
# -----------------------------
BASE_FOLDER = "finger_variations"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# -----------------------------
# 1️⃣ Gather all images
# -----------------------------
finger_folders = [os.path.join(BASE_FOLDER, d) for d in os.listdir(BASE_FOLDER)
                  if os.path.isdir(os.path.join(BASE_FOLDER, d))]
finger_folders.sort()

finger_images = {}
for idx, folder in enumerate(finger_folders, start=1):
    imgs = [os.path.join(folder, f) for f in os.listdir(folder) if f.lower().endswith(".bmp")]
    imgs.sort()
    finger_images[f"finger{idx}"] = imgs

# -----------------------------
# 2️⃣ Compute embeddings
# -----------------------------
embeddings = {}
for finger, imgs in finger_images.items():
    embeddings[finger] = [get_fingerprint_embedding(img) for img in imgs]

# -----------------------------
# 3️⃣ Compute pairwise similarity matrix
# -----------------------------
all_finger_keys = list(embeddings.keys())
all_images = []
for key in all_finger_keys:
    all_images.extend([(key, i) for i in range(len(embeddings[key]))])

num_imgs = len(all_images)
similarity_matrix = np.zeros((num_imgs, num_imgs))

for i in range(num_imgs):
    finger_i, idx_i = all_images[i]
    emb_i = embeddings[finger_i][idx_i]
    for j in range(num_imgs):
        finger_j, idx_j = all_images[j]
        emb_j = embeddings[finger_j][idx_j]
        similarity_matrix[i, j] = torch.nn.functional.cosine_similarity(emb_i, emb_j).item()

# -----------------------------
# 4️⃣ Plot heatmap
# -----------------------------
plt.figure(figsize=(10, 8))
plt.imshow(similarity_matrix, cmap='viridis', interpolation='nearest')
plt.colorbar(label="Cosine Similarity")

# Tick labels
labels = [f"{f}{i+1}" for f, i in all_images]
plt.xticks(range(num_imgs), labels, rotation=90)
plt.yticks(range(num_imgs), labels)

plt.title("Fingerprint Cosine Similarity Heatmap")
plt.tight_layout()
plt.show()
