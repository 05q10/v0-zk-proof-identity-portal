import cv2
import numpy as np
from skimage.morphology import skeletonize
from math import atan2, cos, sin, pi
import hashlib
from simhash import Simhash
import json

# -----------------------------
# CONFIG
# -----------------------------
IMAGE_PATH = "100__M_Left_index_finger.bmp"  # Change this to your file path

# -----------------------------
# STEP 1: Read and preprocess
# -----------------------------
def read_image(path):
    img = cv2.imread(path)
    if img is None:
        raise FileNotFoundError(f"Cannot read image at: {path}")
    if len(img.shape) == 3:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return img

def preprocess_fingerprint(img):
    img = cv2.resize(img, (256, 256))
    edges = cv2.Canny(img, 50, 150)
    lines = cv2.HoughLines(edges, 1, np.pi / 180, 150)
    if lines is not None:
        rho, theta = lines[0][0]
        angle = np.degrees(theta)
        M = cv2.getRotationMatrix2D((128, 128), -angle, 1)
        img = cv2.warpAffine(img, M, (256, 256))
    return img

# -----------------------------
# STEP 2: Enhancement
# -----------------------------
def enhance_contrast(img):
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    return clahe.apply(img)

def gabor_enhance(img, ksize=21, sigma=5.0, theta_list=None, lambd=10.0, gamma=0.5, psi=0):
    if theta_list is None:
        theta_list = np.linspace(0, np.pi, 8, endpoint=False)
    accum = np.zeros_like(img, dtype=np.float32)
    for theta in theta_list:
        kern = cv2.getGaborKernel((ksize, ksize), sigma, theta, lambd, gamma, psi, ktype=cv2.CV_32F)
        filtered = cv2.filter2D(img.astype(np.float32), cv2.CV_32F, kern)
        np.maximum(accum, filtered, out=accum)
    acc = accum - accum.min()
    return (acc / acc.max() * 255).astype(np.uint8) if acc.max() != 0 else acc.astype(np.uint8)

def binarize(img):
    thr = cv2.adaptiveThreshold(img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                cv2.THRESH_BINARY, 21, 5)
    inv = cv2.bitwise_not(thr)
    return inv // 255

def thin(img_bin):
    return skeletonize(img_bin > 0).astype(np.uint8)

# -----------------------------
# STEP 3: Minutiae extraction
# -----------------------------
def minutiae_from_skeleton(skel):
    H, W = skel.shape
    minutiae = []
    gx = cv2.Sobel(skel.astype(np.float32), cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(skel.astype(np.float32), cv2.CV_32F, 0, 1, ksize=3)
    for y in range(1, H-1):
        for x in range(1, W-1):
            if skel[y, x] == 0:
                continue
            nb = skel[y-1:y+2, x-1:x+2].copy()
            nb[1,1] = 0
            count = int(nb.sum())
            if count == 1 or count == 3:
                gxv = gx[y, x]
                gyv = gy[y, x]
                ang = atan2(gyv, gxv) if not (gxv == 0 and gyv == 0) else 0.0
                typ = "ending" if count == 1 else "bifurcation"
                minutiae.append((y, x, typ, ang))
    return minutiae

# -----------------------------
# STEP 4: Descriptor building
# -----------------------------
def pca_normalize_points(points):
    if len(points) == 0:
        return points, 0.0, np.array([0.0, 0.0])
    mean = points.mean(axis=0)
    centered = points - mean
    cov = np.cov(centered.T)
    eigvals, eigvecs = np.linalg.eigh(cov + 1e-9*np.eye(2))
    principal = eigvecs[:, np.argmax(eigvals)]
    angle = atan2(principal[1], principal[0])
    c, s = cos(-angle), sin(-angle)
    R = np.array([[c, -s], [s, c]])
    rotated = centered.dot(R.T)
    return rotated, angle, mean

def build_fixed_descriptor(minutiae, image_shape, grid_size=(16,16), orient_bins=8):
    H, W = image_shape
    pts = np.array([[x, y] for (y, x, _, _) in minutiae], dtype=np.float32)
    if pts.size == 0:
        return np.zeros(grid_size[0]*grid_size[1]*orient_bins, dtype=np.uint8)
    rotated, angle, mean = pca_normalize_points(pts)
    minxy = rotated.min(axis=0)
    maxxy = rotated.max(axis=0)
    span = maxxy - minxy
    span[span == 0] = 1.0
    gx, gy = grid_size
    desc = np.zeros((gy, gx, orient_bins), dtype=np.uint8)
    for (y, x, typ, ang) in minutiae:
        orig = np.array([x, y], dtype=np.float32)
        centered = orig - mean
        c, s = cos(-angle), sin(-angle)
        R = np.array([[c, -s], [s, c]])
        rotated_pt = centered.dot(R.T)
        normx = (rotated_pt[0] - minxy[0]) / span[0]
        normy = (rotated_pt[1] - minxy[1]) / span[1]
        cx = min(max(normx, 0.0), 0.9999)
        cy = min(max(normy, 0.0), 0.9999)
        ix = int(cx * gx)
        iy = int(cy * gy)
        a = (ang + pi) % (2*pi)
        bin_idx = int((a / (2*pi)) * orient_bins) % orient_bins
        desc[iy, ix, bin_idx] = 1
    return desc.flatten()

# -----------------------------
# STEP 5: Tolerant hash
# -----------------------------
def tolerant_hash(descriptor):
    # Convert descriptor bits into textual feature tokens for Simhash
    features = [f"bit_{i}" for i, b in enumerate(descriptor) if b == 1]
    sim_val = Simhash(features).value
    return hashlib.sha256(str(sim_val).encode()).hexdigest()

# -----------------------------
# STEP 6: Main pipeline
# -----------------------------
def fingerprint_to_hash(image_path):
    img = read_image(image_path)
    img = preprocess_fingerprint(img)
    enhanced = enhance_contrast(img)
    gabor = gabor_enhance(enhanced)
    bin_img = binarize(gabor)
    skel = thin(bin_img)
    minutiae = minutiae_from_skeleton(skel)
    descriptor = build_fixed_descriptor(minutiae, skel.shape)
    hash_val = tolerant_hash(descriptor)
    return {
        "IMAGE_PATH": image_path,
        "hash_value": hash_val
    }

# -----------------------------
# ENTRY POINT
# -----------------------------
if __name__ == "__main__":
    result = fingerprint_to_hash(IMAGE_PATH)
    print(json.dumps(result, indent=4))
