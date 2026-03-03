from fastapi import FastAPI, UploadFile, File, HTTPException

from app.detection_services.yolo_service import run_yolo
from app.prediction_services.prediction_service import predict_disease_risk

app = FastAPI(
    title="Urinary Cast Detection & Subtype Classification API",
    description="YOLO-based cast detection with CNN subtype classification and disease risk prediction",
    version="1.0.0"
)

# ----------------------------------------
# Health check
# ----------------------------------------
@app.get("/")
def health_check():
    return {
        "status": "Backend running successfully",
        "service": "Urinary Cast Detection System"
    }

# ----------------------------------------
# Detect casts + classify subtypes + predict risk
# ----------------------------------------
@app.post("/detect-casts/")
async def detect_casts(file: UploadFile = File(...)):
    # Validate file type (basic safety)
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload an image."
        )

    # Read uploaded image
    image_bytes = await file.read()

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    # -----------------------------
    # Stage 1 + 2:
    # YOLO detection + CNN subtype
    # -----------------------------
    result = run_yolo(image_bytes)

    # Extract cast count
    cast_count = result.get("cast_count", 0)

    # -----------------------------
    # Disease risk prediction
    # -----------------------------
    risk_prediction = predict_disease_risk(cast_count)

    # -----------------------------
    # Final unified response
    # -----------------------------
    return {
        "cast_detected": result["cast_detected"],
        "cast_count": cast_count,
        "detections": result["detections"],   # ← includes subtype per cast
        "risk_assessment": risk_prediction
    }
