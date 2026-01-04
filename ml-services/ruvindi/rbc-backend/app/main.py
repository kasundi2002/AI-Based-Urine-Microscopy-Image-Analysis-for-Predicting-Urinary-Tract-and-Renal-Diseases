from fastapi import FastAPI, File, UploadFile
from typing import List
from PIL import Image
import io

from fastapi import FastAPI, File, UploadFile
from PIL import Image
import io

from app.detect_rbc import detect_rbc
from app.crop_utils import crop_rbc_regions
from app.model import load_model, predict_rbc

app = FastAPI(title="RBC Morphology Analyzer")

model = load_model("weights/efficientnet_b2_best.pth")

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    image = Image.open(io.BytesIO(await file.read())).convert("RGB")

    # 1️⃣ Detect RBCs
    boxes = detect_rbc(image)

    # 2️⃣ Crop detected RBCs
    crops = crop_rbc_regions(image, boxes)

    iso_count = 0
    dys_count = 0

    for crop in crops:
        label, prob = predict_rbc(model, crop)
        if label == "iso":
            iso_count += 1
        else:
            dys_count += 1

    total = iso_count + dys_count
    dys_pct = (dys_count / total) * 100 if total > 0 else 0
    origin = "Glomerular" if dys_pct >= 40 else "Non-glomerular"

    return {
        "detected_rbc": total,
        "iso_count": iso_count,
        "dys_count": dys_count,
        "dys_percentage": round(dys_pct, 2),
        "hematuria_origin": origin
    }
