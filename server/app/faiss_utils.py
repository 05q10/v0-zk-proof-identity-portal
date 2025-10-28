import os
import json
import numpy as np
from threading import Lock
import hashlib  # for secure hash-based key derivation


# Fixed directory for fingerprint data
BASE_DIR = "fingerprint_db"
JSON_PATH = os.path.join(BASE_DIR, "embeddings.json")
EMBED_DIM = 128  # default dimension


class FaissStore:
    """
    JSON-based embedding store.
    Stores user_id → embedding mapping and allows searching.
    """

    def __init__(self, dim: int = EMBED_DIM):
        self.dim = dim
        self.lock = Lock()

        # Ensure folder exists
        os.makedirs(BASE_DIR, exist_ok=True)

        # Load stored embeddings
        self.data = self._load_json()
        print(f"✅ Loaded {len(self.data)} embeddings from {JSON_PATH}")

    # ------------------------------------------------
    # Core operations
    # ------------------------------------------------
    def reset_index(self):
        """Clear all stored embeddings."""
        with self.lock:
            self.data = {}
            if os.path.exists(JSON_PATH):
                os.remove(JSON_PATH)
            print("🧹 Cleared all stored embeddings.")

    def add(self, embedding, user_id: int):
        """Add new embedding to JSON store."""
        try:
            vec = np.asarray(embedding, dtype=np.float32).flatten().tolist()
            if len(vec) != self.dim:
                raise ValueError(
                    f"Embedding dimension mismatch: expected {self.dim}, got {len(vec)}"
                )

            with self.lock:
                self.data[str(user_id)] = vec
                self._save_json()
            print(f"✅ Added embedding for user_id={user_id}")

        except Exception as e:
            print(f"❌ ERROR in FaissStore.add: {str(e)}")
            raise

    def add_and_generate_key(self, embedding, password: str, user_id: int):
        """
        Add embedding and generate AES-256 key
        derived from (embedding + password).
        """
        self.add(embedding, user_id)

        embedding_bytes = np.array(embedding, dtype=np.float32).tobytes()
        password_bytes = password.encode("utf-8")
        key = hashlib.sha256(embedding_bytes + password_bytes).digest()

        return key

    def count(self) -> int:
        """Return total stored embeddings."""
        return len(self.data)

    def get_all_embeddings(self):
        """Return list of (user_id, embedding)."""
        return [(int(uid), emb) for uid, emb in self.data.items()]

    def search_similar(self, query_embedding, k: int = 1):
        """
        Search for most similar embedding(s) using cosine similarity.
        """
        if not self.data:
            return []

        query_vec = np.asarray(query_embedding, dtype=np.float32).flatten()
        if len(query_vec) != self.dim:
            raise ValueError(
                f"Query embedding dimension mismatch: expected {self.dim}, got {len(query_vec)}"
            )

        similarities = []
        for user_id_str, stored_embedding in self.data.items():
            stored_vec = np.array(stored_embedding, dtype=np.float32)
            dot_product = np.dot(query_vec, stored_vec)
            norm_query = np.linalg.norm(query_vec)
            norm_stored = np.linalg.norm(stored_vec)
            similarity = (
                dot_product / (norm_query * norm_stored)
                if norm_query != 0 and norm_stored != 0
                else 0.0
            )
            similarities.append((int(user_id_str), float(similarity)))

        similarities.sort(key=lambda x: x[1], reverse=True)
        return similarities[:k]

    # ------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------
    def _load_json(self):
        """Load existing embeddings safely."""
        if os.path.exists(JSON_PATH):
            try:
                with open(JSON_PATH, "r") as f:
                    content = f.read().strip()
                    if not content:
                        print("⚠️ Empty JSON detected — resetting store.")
                        return {}
                    return json.loads(content)
            except json.JSONDecodeError:
                print("⚠️ Invalid JSON detected — resetting store.")
                return {}
        return {}

    def _save_json(self):
        """Save embeddings safely to disk."""
        try:
            with open(JSON_PATH, "w") as f:
                json.dump(self.data, f, indent=4)
            print(f"💾 Saved {len(self.data)} embeddings to {JSON_PATH}")
        except Exception as e:
            print(f"❌ ERROR in _save_json: {str(e)}")
            raise
