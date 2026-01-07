from fastapi import FastAPI, File, UploadFile
from PIL import Image
import io

from app.detect_rbc import detect_rbc
from app.crop_utils import crop_rbc_regions
from app.model import load_model, predict_rbc
from app.questionnaire import QUESTIONS
from app.schemas import QuestionnaireResponse, QuestionnaireAnswers
from app.clinical_logic import generate_final_prediction

# -----------------------------
# App initialization
# -----------------------------
app = FastAPI(title="RBC Morphology Analyzer")

model = load_model("weights/efficientnet_b2_best.pth")

# -----------------------------
# Temporary in-memory storage
# -----------------------------
latest_rbc_result = {}
latest_answers = {}

# -----------------------------
# 1️⃣ Image analysis endpoint
# -----------------------------
@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    global latest_rbc_result

    image = Image.open(io.BytesIO(await file.read())).convert("RGB")

    # Detect RBCs
    boxes = detect_rbc(image)

    # Crop detected RBCs
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

    latest_rbc_result = {
        "detected_rbc": total,
        "iso_count": iso_count,
        "dys_count": dys_count,
        "dys_percentage": round(dys_pct, 2),
        "hematuria_origin": origin
    }

    return latest_rbc_result


# -----------------------------
# 2️⃣ Get questionnaire
# -----------------------------
@app.get("/questionnaire", response_model=QuestionnaireResponse)
def get_questionnaire():
    return {"questions": QUESTIONS}


# -----------------------------
# 3️⃣ Submit questionnaire & merge
# -----------------------------
@app.post("/questionnaire/submit")
def submit_questionnaire(data: QuestionnaireAnswers):
    global latest_answers, latest_rbc_result

    latest_answers = data.answers

    # Safety check
    if not latest_rbc_result:
        return {
            "error": "Please upload urine microscopy image before submitting questionnaire"
        }

    # Merge image + metadata
    final_report = generate_final_prediction(
    rbc_result=latest_rbc_result,
    answers=latest_answers
)


    return {
        "rbc_summary": latest_rbc_result,
        "patient_answers": latest_answers,
        "final_report": final_report
    }
