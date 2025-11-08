import cv2
import torch
import torch.nn.functional as F
from torchvision import transforms, models
import hashlib, hmac

_SECRET_KEY = b"SuperSecretKey_32bytes_length!!!"

# -----------------------------
# 1️⃣ Model + Preprocessing Setup
# -----------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Pretrained model (ResNet18 as embedding extractor)
_model = models.resnet34(pretrained=True)
_model.fc = torch.nn.Identity()  # remove classifier → 512D embedding
_model = _model.to(DEVICE).eval()

# Standard preprocessing pipeline
_transform = transforms.Compose([
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.5], std=[0.5])
])

# -----------------------------
# 2️⃣ Function: image → embedding vector
# -----------------------------
def get_fingerprint_embedding(image_path: str) -> torch.Tensor:
    """
    Reads a fingerprint image (.bmp, .png, etc.) and returns a normalized embedding tensor.
    """
    img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
    if img is None:
        raise ValueError(f"Cannot read image: {image_path}")
    
    # Resize to match model input (224x224 for ResNet)
    img = cv2.resize(img, (224, 224))

    # Convert grayscale → 3 channels for ResNet
    tensor = _transform(img).unsqueeze(0).repeat(1, 3, 1, 1).to(DEVICE)

    # Forward pass to get embedding
    with torch.no_grad():
        embedding = _model(tensor)
        embedding = F.normalize(embedding, dim=1)  # normalize to unit vector

    return embedding.cpu()

# -----------------------------
# 3️⃣ Function: compare two fingerprints
# -----------------------------
def compare_fingerprints(img_path: str, stored_embedding: torch.Tensor) -> float:
    """
    Takes a fingerprint image and a reference embedding, and returns cosine similarity [0,1].
    """
    new_embedding = get_fingerprint_embedding(img_path)
    similarity = F.cosine_similarity(stored_embedding, new_embedding).item()
    return similarity


# -----------------------------
# 4️⃣ Function: embedding + code → SHA-256 hash
# -----------------------------
def embedding_to_sha256(embedding: torch.Tensor, code: str) -> str:
    """
    Converts a tensor embedding and an 6-digit alphanumeric code
    into a deterministic SHA-256 hex string.
    """
    # Validate code
    if not isinstance(code, str) or len(code) != 6 or not code.isalnum():
        raise ValueError("Code must be an 6-digit alphanumeric string (e.g., 'A1B2C3').")

    # Convert tensor to numpy array and bytes
    arr = embedding.squeeze(0).detach().cpu().numpy()
    arr_bytes = arr.tobytes()

    # Combine embedding bytes with the code (encoded as UTF-8)
    combined = arr_bytes + code.encode('utf-8')

    # Compute SHA-256
    sha256_hash = hmac.new(_SECRET_KEY, combined, hashlib.sha256).hexdigest()
    return sha256_hash

# -----------------------------
# 5️⃣ Function: image → SHA-256 hash
# -----------------------------
def image_to_fingerprint_hash(image_path: str, code: str) -> str:
    """
    Complete pipeline:
    1️⃣ Image → embedding
    2️⃣ Embedding + code → SHA-256 hash
    Returns hash string.
    """
    # Step 1: get normalized embedding
    embedding = get_fingerprint_embedding(image_path)

    # Step 2: convert embedding + code to SHA-256
    sha_hash = embedding_to_sha256(embedding, code)

    return sha_hash

if __name__ == "__main__":
    img_path = "demo_finger/100__M_Left_index_finger.bmp"
    hash_val = image_to_fingerprint_hash(img_path,"bx19D0")
    print(f"Fingerprint SHA-256 hash for {img_path} → {hash_val}")
