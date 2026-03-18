<div align="center">

<br/>

<img src="https://img.shields.io/badge/Research-Published-F59E0B?style=for-the-badge&logo=google-scholar&logoColor=white" />
<img src="https://img.shields.io/badge/Domain-Healthcare%20Security-10B981?style=for-the-badge&logo=shield&logoColor=white" />
<img src="https://img.shields.io/badge/Cryptography-AES--256%20%7C%20HMAC-3B82F6?style=for-the-badge&logo=letsencrypt&logoColor=white" />
<img src="https://img.shields.io/badge/Stack-Next.js%20%7C%20FastAPI-EF4444?style=for-the-badge&logo=fastapi&logoColor=white" />

<br/><br/>

# 🔐 Zero-Knowledge Biometric Identity Proof
### Privacy-Preserving Authentication for Healthcare

**A research-backed authentication system that verifies patient identity without ever exposing personal identifiers**  
*Biometric Embeddings · Cryptographic Key Binding · Hardware Security Modules · FAISS Search*

<br/>

> 📄 **Research Paper Published** &nbsp;|&nbsp; 🎓 Cryptography & Network Security — Sardar Patel Institute of Technology &nbsp;|&nbsp; 📅 November 2025

<br/>

</div>

---

## 📌 The Problem

Traditional healthcare authentication systems carry a fundamental contradiction — they rely on **explicit patient identifiers** (usernames, patient IDs, SSNs) to verify identity, yet these very identifiers are a prime target for breaches. A stolen database means stolen identities.

This project proposes an architecture where:

- ✅ A patient is identified **purely through biometric similarity** — no usernames, no IDs
- ✅ Biometric data is **never stored in plaintext** — always encrypted with AES-256
- ✅ Cryptographic keys **never leave the HSM** — zero exposure even under full database compromise
- ✅ The system is **GDPR-aligned** and suitable for real clinical workflows

---

## 🏗️ System Architecture

```
                        ┌─────────────────────────┐
                        │      Patient Device     │
                        │  [Fingerprint Scan]     │
                        │  [Passcode Entry]       │
                        └────────────┬────────────┘
                                     │
                          Biometric Embedding
                          (Deep Learning Model)
                                     │
                                     ▼
              ┌──────────────────────────────────────────┐
              │          FastAPI Authentication Service  │
              │                                          │
              │  ┌─────────────────────────────────┐     │
              │  │   HMAC Key Binding Construction │     │
              │  │   Key = HMAC(passcode, bio_ref) │     │
              │  └────────────────┬────────────────┘     │
              │                   │                      │
              │                   ▼                      │
              │  ┌─────────────────────────────────┐     │
              │  │     Hardware Security Module    │     │
              │  │  • Key derivation & protection  │     │
              │  │  • AES-256 encrypt / decrypt    │     │
              │  │  • Zero plaintext key exposure  │     │
              │  └────────────────┬────────────────┘     │
              └───────────────────┼──────────────────────┘
                                  │
                    Encrypted Embedding Query
                                  │
                                  ▼
              ┌───────────────────────────────────────────┐
              │           PostgreSQL + FAISS Index        │
              │  • Encrypted biometric vectors at rest    │
              │  • Similarity search within sec. boundary │
              │  • No plaintext embeddings ever persisted │
              └───────────────────────────────────────────┘
                                  │
                        Identity Resolved ✅
                     (No identifier used or stored)
```

---

## ✨ Key Features

### 🪪 Identifier-Free Authentication
Resolves patient identity directly through **biometric similarity search** — no usernames, patient IDs, or any personal identifier ever enters the authentication pipeline. Identity is a *mathematical property*, not a stored string.

### 🔑 Biometric–Passcode Key Binding
Cryptographic keys are derived using an **HMAC-based construction** that securely combines the user's passcode with a stable biometric reference vector. Neither factor alone can reconstruct the key — both must be present simultaneously.

```
Key = HMAC-SHA256( passcode, biometric_reference_embedding )
```

### 🛡️ Hardware-Enforced Key Protection
All key material lives exclusively inside a **Hardware Security Module (HSM)**. Encryption and decryption operations are performed *inside* the HSM boundary — keys are never exported, never logged, never visible in memory.

### 🔒 Encrypted Biometric Storage & Search
Biometric embeddings are stored encrypted with **AES-256**. Similarity search is performed using **FAISS** operating within the protected security boundary — meaning even a full database dump yields no usable biometric data.

### ⚡ High-Performance Authentication
The system achieves **low-latency identity resolution** and high throughput on commodity hardware, making it viable for real-time clinical environments where delays can impact patient care.

### 📋 Regulatory-Compliant Design
Architecture is designed to align with **GDPR Article 9** (special category biometric data), **HIPAA** security requirements, and general healthcare data confidentiality standards — without sacrificing usability.

---

## 🔬 How Authentication Works

```
ENROLLMENT
──────────
1. Capture fingerprint  →  Generate deep biometric embedding (512-d vector)
2. Encrypt embedding    →  AES-256 via HSM using HMAC-derived key
3. Store ciphertext     →  PostgreSQL, indexed in FAISS (no plaintext ever)

AUTHENTICATION
──────────────
1. Capture fingerprint  →  Generate query embedding
2. Enter passcode       →  Reconstruct HMAC key inside HSM
3. FAISS similarity     →  Search encrypted embedding space
4. HSM decrypts match   →  Verify cosine similarity threshold
5. Access granted       →  Identity resolved, session token issued
```

---

## 🛠️ Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js |
| **Backend API** | FastAPI (Python) |
| **Database** | PostgreSQL |
| **Vector Search** | FAISS |
| **Encryption** | AES-256 |
| **Key Binding** | HMAC-SHA256 |
| **Key Protection** | Hardware Security Module (HSM) |
| **Biometrics** | Deep Learning Fingerprint Embeddings |

</div>

---

## 🔐 Security Properties

| Property | Guarantee |
|----------|-----------|
| **Confidentiality** | Biometric data encrypted at rest and in transit |
| **Zero Plaintext** | Keys never exposed outside HSM boundary |
| **Unlinkability** | No stored identifier can link records to real-world identity |
| **Breach Resistance** | Full DB compromise yields only AES-256 ciphertext |
| **Recoverability** | Key re-derivation possible via HMAC construction on re-enrollment |
| **Integrity** | HMAC-based binding detects tampering |

---

## 📊 Performance Highlights

- 🚀 **Low-latency** identity resolution — suitable for real-time clinical workflows
- 📈 **High throughput** on commodity hardware without GPU requirement for inference
- 🔍 **FAISS ANN search** scales to large patient populations with sub-linear query time
- 🏥 **Concurrent session** support without contention on HSM operations

---

## 🚀 Future Scope

- [ ] 🧬 **Multi-modal biometrics** — iris + fingerprint fusion for higher assurance
- [ ] 🔗 **Federated identity** — cross-hospital zero-knowledge proofs using ZK-SNARKs
- [ ] 📱 **Mobile HSM integration** — secure enclave support on iOS / Android
- [ ] 🌐 **Decentralized identity** — self-sovereign identity (SSI) with DID standards
- [ ] 🤖 **Liveness detection** — anti-spoofing module for biometric capture
- [ ] 📜 **Formal verification** — cryptographic protocol proof using ProVerif / Tamarin

---

## 👥 Authors

> 🎓 **Sardar Patel Institute of Technology**  
> 📚 Cryptography & Network Security — Mini Project · November 2025

| Name | Role |
|------|------|
| **Ria Talsania** | Co-Author |
| **Mihit Singasane** | Co-Author |
| **Ved Thakker** | Co-Author |
| **Prof. Abhijeet Salunkhe** | Project Guide |

---

## ⚠️ Disclaimer

> This system is a **research prototype** developed for academic purposes.  
> It is not certified for production deployment in clinical or regulated healthcare environments without further security audit and compliance review.

---

<div align="center">

Made with 🔐 at **Sardar Patel Institute of Technology**

⭐ *If this research was useful to you, consider giving it a star!*

</div>
