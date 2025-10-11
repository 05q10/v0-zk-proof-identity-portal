import os
import cv2
import numpy as np

# -----------------------------
# CONFIG
# -----------------------------
INPUT_FOLDER = "demo_finger"      # Original fingerprints
OUTPUT_FOLDER = "finger_variations"  # Where to save structured variations
VAR_COUNT = 5                       # Number of variations per fingerprint

os.makedirs(OUTPUT_FOLDER, exist_ok=True)

# -----------------------------
# Helper: generate variations
# -----------------------------
def generate_variations(img, count=5):
    h, w = img.shape[:2]
    variations = []
    for _ in range(count):
        angle = np.random.uniform(-10, 10)        # rotation
        scale = np.random.uniform(0.9, 1.1)      # scaling
        tx = np.random.uniform(-5, 5)            # translation x
        ty = np.random.uniform(-5, 5)            # translation y

        M = cv2.getRotationMatrix2D((w//2, h//2), angle, scale)
        M[:, 2] += (tx, ty)
        mod = cv2.warpAffine(img, M, (w, h), borderMode=cv2.BORDER_REFLECT)

        # Occasionally add tiny noise or blur
        if np.random.rand() < 0.3:
            mod = cv2.GaussianBlur(mod, (3,3), 0)
        if np.random.rand() < 0.3:
            noise = np.random.normal(0, 3, img.shape).astype(np.float32)
            mod = np.clip(mod + noise, 0, 255).astype(np.uint8)

        variations.append(mod)
    return variations

# -----------------------------
# MAIN
# -----------------------------
def main():
    np.random.seed(42)  # reproducible

    # Iterate all original fingerprint images
    files = [f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(".bmp")]
    files.sort()

    for idx, fname in enumerate(files, start=1):
        img_path = os.path.join(INPUT_FOLDER, fname)
        img = cv2.imread(img_path, cv2.IMREAD_GRAYSCALE)
        if img is None:
            print(f"⚠️ Cannot read {img_path}, skipping")
            continue

        # Create folder for this fingerprint
        finger_folder = os.path.join(OUTPUT_FOLDER, f"finger{idx}")
        os.makedirs(finger_folder, exist_ok=True)

        # Generate variations
        variations = generate_variations(img, VAR_COUNT)

        # Save all variations
        for v_idx, v_img in enumerate(variations, start=1):
            save_path = os.path.join(finger_folder, f"img{v_idx}.bmp")
            cv2.imwrite(save_path, v_img)
        print(f"✅ Saved {VAR_COUNT} variations for {fname} → {finger_folder}")

if __name__ == "__main__":
    main()
