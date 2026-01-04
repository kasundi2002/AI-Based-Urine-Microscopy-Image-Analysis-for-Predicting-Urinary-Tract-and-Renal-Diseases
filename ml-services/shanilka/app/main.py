from fastapi import FastAPI, UploadFile, File

from app.detection_services.yolo_service import run_yolo
from app.prediction_services.prediction_service import predict_disease_risk

app = FastAPI(title="Urinary Cast Detection & Risk Prediction API")

# ----------------------------------------
# Health check
# ----------------------------------------
@app.get("/")
def health_check():
    return {"status": "Backend running successfully"}

# ----------------------------------------
# Detect casts + predict disease risk
# ----------------------------------------
@app.post("/detect-casts/")
async def detect_casts(file: UploadFile = File(...)):
    # Read uploaded image
    image_bytes = await file.read()

    # Run YOLO + CNN pipeline
    result = run_yolo(image_bytes)

    # Extract cast count
    cast_count = result["cast_count"]

    # Predict disease risk
    risk_prediction = predict_disease_risk(cast_count)

    # Merge response
    return {
        **result,
        "risk_assessment": risk_prediction
    }
