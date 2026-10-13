import os
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(
    title="Adaptive Fraud Intelligence API",
    version="1.0.0",
    description="Backend API for high-volume fraud prediction and temporal surge analysis"
)

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained model if available, else fallback to mock model
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "xgb_fraud_model.pkl")
model = None

if os.path.exists(MODEL_PATH):
    try:
        model = joblib.load(MODEL_PATH)
        print(f"Loaded trained ML model from {MODEL_PATH}")
    except Exception as e:
        print(f"Error loading model: {e}")
else:
    print("No trained model found at models/xgb_fraud_model.pkl. Using heuristic rules.")

class TransactionPayload(BaseModel):
    Time: float
    Amount: float
    V1: float
    V2: float
    V3: float
    V4: Optional[float] = 0.0
    V5: Optional[float] = 0.0
    V6: Optional[float] = 0.0
    V7: Optional[float] = 0.0
    V8: Optional[float] = 0.0
    V9: Optional[float] = 0.0
    V10: Optional[float] = 0.0
    V11: Optional[float] = 0.0
    V12: Optional[float] = 0.0
    V13: Optional[float] = 0.0
    V14: Optional[float] = 0.0
    V15: Optional[float] = 0.0
    V16: Optional[float] = 0.0
    V17: Optional[float] = 0.0
    V18: Optional[float] = 0.0
    V19: Optional[float] = 0.0
    V20: Optional[float] = 0.0
    V21: Optional[float] = 0.0
    V22: Optional[float] = 0.0
    V23: Optional[float] = 0.0
    V24: Optional[float] = 0.0
    V25: Optional[float] = 0.0
    V26: Optional[float] = 0.0
    V27: Optional[float] = 0.0
    V28: Optional[float] = 0.0
    velocity_score: Optional[float] = 0.2
    surge_score: Optional[float] = 0.1

class PredictionResult(BaseModel):
    fraud_probability: float
    velocity_score: float
    surge_score: float
    risk_score: int
    decision: str
    reasons: List[str]

@app.get("/")
def health_check():
    return {
        "status": "online",
        "system": "Adaptive Fraud Intelligence",
        "model_loaded": model is not None
    }

@app.post("/predict", response_model=PredictionResult)
def predict_transaction(tx: TransactionPayload):
    # 1. Feature Vector Assembly
    features = [
        tx.Time, tx.V1, tx.V2, tx.V3, tx.V4, tx.V5, tx.V6, tx.V7, tx.V8, tx.V9,
        tx.V10, tx.V11, tx.V12, tx.V13, tx.V14, tx.V15, tx.V16, tx.V17, tx.V18,
        tx.V19, tx.V20, tx.V21, tx.V22, tx.V23, tx.V24, tx.V25, tx.V26, tx.V27,
        tx.V28, tx.Amount
    ]

    # 2. ML Probability Calculation
    if model is not None:
        X = np.array(features).reshape(1, -1)
        fraud_prob = float(model.predict_proba(X)[0][1])
    else:
        # Heuristic calculation based on critical V features
        anomaly_sum = abs(tx.V14) + abs(tx.V17) + abs(tx.V10) + abs(tx.V12)
        if tx.V14 < -4 or tx.V17 < -5:
            fraud_prob = min(0.98, 0.60 + (anomaly_sum / 50.0))
        else:
            fraud_prob = max(0.01, min(0.35, anomaly_sum / 100.0))

    # 3. Temporal & Velocity Analysis
    amount_z = max(0, (tx.Amount - 88.34) / 250.12)
    
    # Adaptive Surge Discounting
    # If surge is high but ML probability is very low, decrease risk weight on velocity
    effective_velocity = tx.velocity_score
    if tx.surge_score > 0.6 and fraud_prob < 0.2:
        effective_velocity *= 0.5  # Surge tolerance adjustment

    # 4. Composite Risk Fusion
    raw_risk = (fraud_prob * 50) + (effective_velocity * 25) + (min(amount_z, 3) * 10) + (tx.surge_score * 15)
    final_risk = int(min(99, max(1, round(raw_risk))))

    # 5. Decision Assignment
    if final_risk >= 70:
        decision = "BLOCK"
    elif final_risk >= 40:
        decision = "REVIEW"
    else:
        decision = "ALLOW"

    # 6. Reasons Generation
    reasons = []
    if fraud_prob > 0.5:
        reasons.append("High ML Fraud Probability pattern match (V14/V17 anomaly)")
    if tx.velocity_score > 0.7:
        reasons.append("High transaction velocity detected in 5-min rolling window")
    if tx.Amount > 500:
        reasons.append("Transaction amount significantly exceeds baseline median")
    if tx.surge_score > 0.6 and fraud_prob < 0.2:
        reasons.append("High volume surge tolerated due to normal ML feature profile")
    if not reasons:
        reasons.append("Normal transaction parameters within historical threshold")

    return PredictionResult(
        fraud_probability=round(fraud_prob, 4),
        velocity_score=round(tx.velocity_score, 4),
        surge_score=round(tx.surge_score, 4),
        risk_score=final_risk,
        decision=decision,
        reasons=reasons
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)