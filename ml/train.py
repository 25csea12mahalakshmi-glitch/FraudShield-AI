import os
import pandas as pd
import numpy as np
import joblib
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score, precision_recall_curve, auc

def train():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "creditcard.csv")
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    if not os.path.exists(data_path):
        print(f"Dataset not found at {data_path}.")
        print("Creating synthetic training data for demo purposes...")
        np.random.seed(42)
        n_samples = 10000
        X_dummy = np.random.randn(n_samples, 30)
        y_dummy = np.random.choice([0, 1], size=n_samples, p=[0.98, 0.02])
        df = pd.DataFrame(X_dummy, columns=[f"V{i}" for i in range(1, 29)] + ["Time", "Amount"])
        df["Class"] = y_dummy
    else:
        print(f"Loading dataset from {data_path}...")
        df = pd.read_csv(data_path)

    X = df.drop(columns=["Class"])
    y = df["Class"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training XGBoost Fraud Classifier...")
    # Scale positive weight to handle class imbalance (0.172% fraud)
    scale_pos_weight = (len(y_train) - sum(y_train)) / sum(y_train)
    
    model = XGBClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        scale_pos_weight=scale_pos_weight,
        random_state=42,
        eval_metric="logloss"
    )
    
    model.fit(X_train, y_train)

    # Evaluation
    preds = model.predict(X_test)
    probs = model.predict_proba(X_test)[:, 1]

    roc_auc = roc_auc_score(y_test, probs)
    precision, recall, _ = precision_recall_curve(y_test, probs)
    pr_auc = auc(recall, precision)

    print("\n--- MODEL EVALUATION ---")
    print(f"ROC-AUC: {roc_auc:.4f}")
    print(f"PR-AUC:  {pr_auc:.4f}")
    print("\nClassification Report:\n", classification_report(y_test, preds))

    model_path = os.path.join(models_dir, "xgb_fraud_model.pkl")
    joblib.dump(model, model_path)
    print(f"Model saved successfully to {model_path}")

if __name__ == "__main__":
    train()