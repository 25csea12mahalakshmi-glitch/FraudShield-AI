# 🛡️ FraudShield AI — Adaptive Fraud Intelligence Engine

> Real-Time Risk Evaluation & Macro-Surge Decoupling Engine for Enterprise Checkout Protection

![Build Status](https://img.shields.io/badge/status-active-emerald)
![License](https://img.shields.io/badge/license-MIT-cyan)
![Python](https://img.shields.io/badge/backend-FastAPI_/_Python-blue)
![React](https://img.shields.io/badge/frontend-React_/_Tailwind-61dafb)

---

## 📌 Executive Summary

Traditional fraud detection engines rely on rigid velocity limits (e.g., *X purchases in Y minutes*). During high-demand promotional events like **Flash Sales** or **Black Friday**, these naive rules panic—triggering massive false-positive blocks that lock out genuine customers. Conversely, coordinated fraud rings exploit these windows by masking rapid bot attacks within high traffic volumes.

**FraudShield AI** solves this with an **Adaptive Surge Decoupling Engine**. By combining supervised machine learning signature checks with decay-weighted velocity tracking, FraudShield AI dynamically distinguishes between legitimate macro traffic surges and coordinated botnet attacks in sub-50ms evaluations.

---

## ✨ Key Features

* **⚡ Real-Time Stream Processing**: Live evaluation of incoming transaction payloads using exponential time-decay windowing.
* **🌊 Adaptive Surge Decoupling**: Dynamically dampens velocity risk when transaction signatures align with legitimate user behavior ($P_{ML} < 0.20$), preventing false-positive checkout blocks during flash sales.
* **🔍 Explainable AI (XAI) Inspector**: Deep-dive component analysis breakdown for every transaction, explaining exactly why an action (`ALLOW`, `REVIEW`, `BLOCK`) was taken.
* **🎛️ Dynamic Calibration Sliders**: Real-time interactive controls for risk managers to tune Block/Review thresholds and Surge Dampening multipliers on the fly.
* **🛡️ Fail-Safe Reset System**: Built-in modal workflow to safely purge live stream buffers and re-initialize state without losing baseline configurations.

---

## 🧠 System Architecture & Algorithm Pipeline
┌────────────────────────────────────────────────────────────────────────┐
│                   Incoming Transaction Payload                         │
│             (Time, Amount, Anonymized PCA Features V1-V28)              │
└───────────────────────────────────┬────────────────────────────────────┘
│
▼
┌────────────────────────────┴──────────────────────────┐
│                                                       │
▼                                                       ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│       XGBoost Classifier      │               │   Decay-Weighted Velocity     │
│   Calculates Fraud Prob (P_ml)│               │   Calculates Frequency Burst   │
└──────────────┬────────────────┘               └──────────────┬────────────────┘
│                                               │
└────────────────────┬──────────────────────────┘
│
▼
┌───────────────────────────────────┐
│ Adaptive Surge Decoupling Engine  │
└─────────────────┬─────────────────┘
│
┌───────────────────────────────┴───────────────────────────────┐
│                                                               │
▼                                                               ▼
[High Velocity + Normal ML]                            [High Velocity + ML Anomaly]
➜ Flash Sale Detected                                   ➜ Coordinated Botnet
➜ Apply Surge Dampening                                 ➜ Escalate Risk Score
➜ Decision: ALLOW                                       ➜ Decision: BLOCK

### Core Algorithms

| Algorithm | Role | Plain English Explanation |
| :--- | :--- | :--- |
| **XGBoost Classifier** | Supervised Fraud Scoring | Acts like a panel of expert detectives analyzing non-linear feature relationships (focusing heavily on key vectors like $V14$ and $V17$). |
| **PCA Transformation** | Anonymization & Privacy | Compresses complex user identity data into 28 orthogonal vectors, ensuring PII compliance while preserving critical risk signals. |
| **$Z$-Score Normalization** | Amount Anomaly Detection | Measures standard deviation ($\sigma$) from mean customer spend to catch unusual monetary spikes. |
| **Decay-Weighted Velocity** | Frequency Tracking | Uses exponential time-decay to weight immediate transaction bursts heavier than older activity. |
| **Surge Decoupling Engine** | False Positive Mitigation | Evaluates conditional risk ($P_{ML}$ vs Velocity) to allow real buyers during flash sales while instantly blocking botnets. |

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS, Lucide React (Iconography)
* **Backend**: FastAPI (Python), Uvicorn
* **ML / Analytics**: XGBoost, NumPy, Pandas, Scikit-Learn
* **State Management**: React Hooks & Custom Simulation Engines

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18+ recommended)
* **Python** (v3.10+ recommended)

### 1. Clone the Repository
```bash
git clone [https://github.com/25csea12mahalakshmi-glitch/FraudShield-AI.git](https://github.com/25csea12mahalakshmi-glitch/FraudShield-AI.git)
cd FraudShield-AI

2. Backend Setup (FastAPI)
Bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies & start server
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

Backend API Docs will be available at: http://localhost:8000/docs

3. Frontend Setup (React)
Open a new terminal window:

Bash
# Navigate to frontend directory
cd frontend

# Install dependencies & start dev server
npm install
npm run dev
Frontend Application will be available at: http://localhost:5173

📊 Decision Rule FrameworkThe composite risk score ranges from 0 to 100 based on the weighted sum of ML probability, surge-adjusted velocity, and amount anomalies:$$\text{Final Risk} = \min\left(99, \text{Round}\left(50 \cdot P_{ML} + 25 \cdot V_{eff} + 10 \cdot \min(Z, 3) + 15 \cdot S\right)\right)$$< 40 (Low Risk) ➔ ALLOW: Instant auto-approval.40 - 60 (Medium Risk) ➔ REVIEW: Triggers step-up authentication (2FA/OTP) or manual review queue.>= 70 (High Risk) ➔ BLOCK: Immediate automated rejection.👥 TeamTeam Name: FraudShieldProject: FraudShield AI📄 LicenseThis project is licensed under the MIT License - see the LICENSE file for details.
