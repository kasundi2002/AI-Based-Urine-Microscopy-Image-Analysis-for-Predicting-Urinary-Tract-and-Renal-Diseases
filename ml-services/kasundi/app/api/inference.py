# app/api/inference.py

from fastapi import APIRouter, UploadFile, File
from app.models.wbc_detector import detect_wbc
from app.models.yeast_detector import detect_yeast
from app.models.ecoli_classifier import classify_ecoli
from app.logic.uti_rules import decide_uti

router = APIRouter(prefix="/predict", tags=["Inference"])

@router.post("/")
async def predict(image: UploadFile = File(...)):
    image_bytes = await image.read()

    wbc_count = detect_wbc(image_bytes)
    yeast_count = detect_yeast(image_bytes)
    ecoli_present = classify_ecoli(image_bytes)

    uti_present = decide_uti(
        wbc_count=wbc_count,
        yeast_count=yeast_count,
        ecoli_present=ecoli_present
    )

    return {
        "wbc_count": wbc_count,
        "yeast_count": yeast_count,
        "ecoli_present": ecoli_present,
        "uti_present": uti_present
    }
