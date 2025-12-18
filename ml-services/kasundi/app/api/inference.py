# app/api/inference.py

from fastapi import APIRouter, UploadFile, File
from app.models.wbc_detector import detect_wbc
from app.models.yeast_detector import detect_yeast
from app.models.ecoli_classifier import classify_ecoli
from app.logic.uti_rules import decide_uti
from app.models.clinical_dataset1 import predict_dataset1
from app.models.clinical_dataset2 import predict_dataset2
from fastapi import APIRouter, UploadFile, File, Form

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

router = APIRouter(prefix="/predict_with_metadata", tags=["Inference"])

def fuse_decisions(
    image_uti: bool,
    dataset2_lower_prob: float,
    dataset2_upper_prob: float,
    dataset1_prob: float
) -> dict:
    """
    Hierarchical multi-modal fusion
    """

    # Final UTI decision
    if image_uti:
        final_uti = True
    elif dataset2_lower_prob >= 0.7 or dataset2_upper_prob >= 0.7:
        final_uti = True
    elif dataset1_prob >= 0.8:
        final_uti = True
    else:
        final_uti = False

    # UTI type
    if dataset2_upper_prob >= 0.7:
        uti_type = "Upper UTI"
    elif dataset2_lower_prob >= 0.7:
        uti_type = "Lower UTI"
    else:
        uti_type = "Uncertain / Not classified"

    return final_uti, uti_type


@router.post("/predict_with_metadata")
async def predict_with_metadata(
    image: UploadFile = File(...),

    # Dataset-1 (symptoms)
    age: int = Form(...),
    gender: int = Form(...),
    dysuria: int = Form(...),
    abd_pain: int = Form(...),
    fever: int = Form(...),
    polyuria: int = Form(...),

    # Dataset-2 (clinical indicators)
    temperature: float = Form(...),
    nausea: int = Form(...),
    lumbar_pain: int = Form(...),
    urine_pushing: int = Form(...),
    micturition_pain: int = Form(...),
    urethral_burning: int = Form(...)
):
    image_bytes = await image.read()

    # --- Microscopy ---
    wbc_count = detect_wbc(image_bytes)
    yeast_count = detect_yeast(image_bytes)
    ecoli_present = classify_ecoli(image_bytes)

    image_based_uti = decide_uti(
        wbc_count=wbc_count,
        yeast_count=yeast_count,
        ecoli_present=ecoli_present
    )

    # --- Dataset-1 ---
    dataset1_prob = predict_dataset1({
        "age": age,
        "gender": gender,
        "dysuria": dysuria,
        "abd_pain": abd_pain,
        "fever": fever,
        "polyuria": polyuria
    })

    # --- Dataset-2 ---
    bladder_prob, renal_prob = predict_dataset2({
        "temperature": temperature,
        "nausea": nausea,
        "lumbar_pain": lumbar_pain,
        "urine_pushing": urine_pushing,
        "micturition_pain": micturition_pain,
        "urethral_burning": urethral_burning
    })

    # --- Fusion ---
    final_uti, uti_type = fuse_decisions(
        image_uti=image_based_uti,
        dataset2_lower_prob=bladder_prob,
        dataset2_upper_prob=renal_prob,
        dataset1_prob=dataset1_prob
    )

    return {
        "wbc_count": wbc_count,
        "yeast_count": yeast_count,
        "ecoli_present": ecoli_present,

        "image_based_uti": image_based_uti,

        "dataset1_uti_probability": round(dataset1_prob, 3),
        "dataset2_bladder_probability": round(bladder_prob, 3),
        "dataset2_renal_probability": round(renal_prob, 3),

        "final_uti": final_uti,
        "uti_type": uti_type
    }
