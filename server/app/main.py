from fastapi import FastAPI
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from app.schemas import UserCreate
from app.models import User
import hashlib, os
from app.fp_utils import get_fingerprint_embedding, image_to_fingerprint_hash, embedding_to_sha256
from app.faiss_utils import FaissStore
from Crypto.Cipher import AES
from Crypto.Util.Padding import unpad
from app.db import Base, engine, SessionLocal
from fastapi.responses import JSONResponse
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or specific origins like ["https://your-frontend.com"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Create all tables (if models exist)
Base.metadata.create_all(bind=engine)

def aes_encrypt(data: str, key: bytes) -> bytes:
    """Encrypts plaintext using AES (ECB mode) with a 32-byte key."""
    if not isinstance(key, bytes):
        raise TypeError("Key must be bytes")

    if len(key) != 32:
        raise ValueError("AES key must be exactly 32 bytes long")

    cipher = AES.new(key, AES.MODE_ECB)
    pad_len = 16 - (len(data.encode()) % 16)
    padded = data.encode() + bytes([pad_len]) * pad_len
    return cipher.encrypt(padded)


def aes_decrypt(ciphertext: bytes, key: bytes) -> str:
    """Decrypts AES ciphertext using AES (ECB mode) with a 32-byte key."""
    if not isinstance(key, bytes):
        raise TypeError("Key must be bytes")

    if len(key) != 32:
        raise ValueError("AES key must be exactly 32 bytes long")

    cipher = AES.new(key, AES.MODE_ECB)
    decrypted = cipher.decrypt(ciphertext)
    pad_len = decrypted[-1]

    # Validate and remove padding
    if pad_len < 1 or pad_len > 16:
        raise ValueError("Invalid padding detected")

    return decrypted[:-pad_len].decode()

@app.get("/")
def home():
    return {"message": "Database connected successfully!"}

@app.post("/register")
async def register_user(
    full_name: str = Form(...),
    date_of_birth: str = Form(...),
    gender: str = Form(...),
    email_id: str = Form(...),
    mobile_number: str = Form(...),
    address: str = Form(...),
    aadhar_number: str = Form(...),
    pan_number: str = Form(...),
    passcode: str = Form(...),
    image: UploadFile = File(...)
):
    os.makedirs("images", exist_ok=True)

    contents = await image.read()
    file_path = os.path.join("images", image.filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    key = image_to_fingerprint_hash(file_path, passcode)
    print(key)

    # Step 2️⃣: Encrypt all sensitive fields
    enc_full_name = aes_encrypt(full_name, key)
    enc_dob = aes_encrypt(date_of_birth, key)
    enc_gender = aes_encrypt(gender, key)
    enc_mobile = aes_encrypt(mobile_number, key)
    enc_address = aes_encrypt(address, key)
    enc_aadhar = aes_encrypt(aadhar_number, key)
    enc_pan = aes_encrypt(pan_number, key)

    db = SessionLocal()
    try:
        new_user = User(
            full_name=enc_full_name,
            date_of_birth=enc_dob,
            gender=enc_gender,
            email_id=email_id,  # keep plain
            mobile_number=enc_mobile,
            address=enc_address,
            aadhar_number=enc_aadhar,
            pan_number=enc_pan,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # 4️⃣ Generate fingerprint embedding
        embedding = get_fingerprint_embedding(file_path)

        # 5️⃣ Add embedding to FAISS DB with user_id
        faiss_store = FaissStore()              # create instance
        faiss_store.add(embedding, new_user.user_id)

        return JSONResponse(
        content={"message": "Registered successfully"},
        status_code=200 
        )

    except Exception as e:
        db.rollback()
        return {"status": "failed", "error": str(e)}
    finally:
        db.close()

@app.post("/verify")
async def verify_user(
    image: UploadFile = File(...),
    passcode: str = Form(...)
):
    # 1️⃣ Save temp image
    os.makedirs("temp", exist_ok=True)
    file_path = os.path.join("temp", image.filename)
    contents = await image.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    # 2️⃣ Get embedding from fingerprint
    query_embedding = get_fingerprint_embedding(file_path)

    # 3️⃣ Find closest match from FAISS JSON store
    faiss_store = FaissStore()
    results = faiss_store.search_similar(query_embedding, k=1)

    if not results or results[0][1] < 0.9:  # similarity threshold
        return {"message": "Fingerprint not recognized"}, 401

    matched_user_id = results[0][0]

    stored_embedding = np.array(faiss_store.data[str(matched_user_id)], dtype=np.float32)

    # Step 2️⃣: Recreate the same SHA-256 key (as bytes directly)
    key_hex = embedding_to_sha256(stored_embedding, passcode)
    key = hashlib.sha256(bytes.fromhex(key_hex)).digest() if isinstance(key_hex, str) else key_hex
    print(key)

    # 5️⃣ Fetch user record from DB
    db = SessionLocal()
    user = db.query(User).filter(User.user_id == matched_user_id).first()
    if not user:
        return {"message": "User not found"}, 404

    # 6️⃣ Attempt to decrypt fields
    try:
        decrypted_data = {
            "user_id": user.user_id,
            "full_name": aes_decrypt(user.full_name, key),
            "date_of_birth": aes_decrypt(user.date_of_birth, key),
            "gender": aes_decrypt(user.gender, key),
            "email_id": user.email_id,
            "mobile_number": aes_decrypt(user.mobile_number, key),
            "address": aes_decrypt(user.address, key),
            "aadhar_number": aes_decrypt(user.aadhar_number, key),
            "pan_number": aes_decrypt(user.pan_number, key),
        }

    except ValueError as e:
        # This usually means the AES key (derived from fingerprint + passcode) is wrong
        if "Invalid padding" in str(e):
            return {"message": "Passcode does not match fingerprint"}, 401
        else:
            return {"message": f"Decryption error: {str(e)}"}, 400

    return {"message": "Verification successful", "data": decrypted_data}
