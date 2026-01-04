from fastapi import APIRouter, UploadFile, File, Form
import cv2
import numpy as np

# --- Microscopy models ---
from app.models.wbc_detector import detect_wbc
from app.models.yeast_detector import detect_yeast
from app.models.ecoli_classifier import classify_ecoli

# --- Clinical models ---
from app.models.clinical_dataset1 import predict_dataset1
from app.models.clinical_dataset2 import predict_dataset2

# --- Segmentation models ---
from app.models.wbc_segmenter import segment_wbc
from app.models.yeast_segmenter import segment_yeast

# --- Logic ---
from app.logic.uti_rules import decide_uti
from app.logic.fusion import fuse_decisions, compute_confidence
from app.logic.severity import compute_severity

router = APIRouter(tags=["Inference"])


# --------------------------------------------------
# Image-only inference
# --------------------------------------------------
@router.post("/predict")
async def predict(image: UploadFile = File(...)):
    image_bytes = await image.read()

    wbc_count = detect_wbc(image_bytes)
    yeast_count = detect_yeast(image_bytes)
    ecoli_present = classify_ecoli(image_bytes)

    image_based_uti = decide_uti(
        wbc_count=wbc_count,
        yeast_count=yeast_count,
        ecoli_present=ecoli_present
    )

    return {
        "wbc_count": wbc_count,
        "yeast_count": yeast_count,
        "ecoli_present": ecoli_present,
        "image_based_uti": image_based_uti
    }


# --------------------------------------------------
# Image + metadata + optional segmentation
# --------------------------------------------------
@router.post("/predict_with_metadata")
async def predict_with_metadata(
    image: UploadFile = File(...),
    include_segmentation: bool = Form(False),

    # Dataset-1
    age: int = Form(...),
    gender: int = Form(...),
    dysuria: int = Form(...),
    abd_pain: int = Form(...),
    fever: int = Form(...),
    polyuria: int = Form(...),

    # Dataset-2
    temperature: float = Form(...),
    nausea: int = Form(...),
    lumbar_pain: int = Form(...),
    urine_pushing: int = Form(...),
    micturition_pain: int = Form(...),
    urethral_burning: int = Form(...)
):
    # ------------------------------------------------
    # Read image
    # ------------------------------------------------
    image_bytes = await image.read()

    image_np = cv2.imdecode(
        np.frombuffer(image_bytes, np.uint8),
        cv2.IMREAD_COLOR
    )
    image_area = image_np.shape[0] * image_np.shape[1]

    # ------------------------------------------------
    # Microscopy (Detection)
    # ------------------------------------------------
    wbc_count = detect_wbc(image_bytes)
    yeast_count = detect_yeast(image_bytes)
    ecoli_present = classify_ecoli(image_bytes)

    image_based_uti = decide_uti(
        wbc_count=wbc_count,
        yeast_count=yeast_count,
        ecoli_present=ecoli_present
    )

    # ------------------------------------------------
    # Optional Segmentation + Severity
    # ------------------------------------------------
    wbc_area = 0
    yeast_area = 0

    wbc_severity_label = "Not computed"
    yeast_severity_label = "Not computed"

    wbc_sev_score = 0.0
    yeast_sev_score = 0.0

    if include_segmentation:
        if wbc_count > 0:
            # segmenters may return (area,), (area, mask) or (area, mask, overlay)
            res = segment_wbc(image_bytes)
            if isinstance(res, (list, tuple)):
                wbc_area = res[0] if len(res) >= 1 else 0
            else:
                # if the function returns a scalar
                wbc_area = res if isinstance(res, (int, float)) else 0

            wbc_severity_label, wbc_sev_score = compute_severity(
                wbc_area, image_area
            )

        if yeast_count > 0:
            # segmenters may return (area,), (area, mask) or (area, mask, overlay)
            res = segment_yeast(image_bytes)
            if isinstance(res, (list, tuple)):
                yeast_area = res[0] if len(res) >= 1 else 0
            else:
                # if the function returns a scalar
                yeast_area = res if isinstance(res, (int, float)) else 0

            yeast_severity_label, yeast_sev_score = compute_severity(
                yeast_area, image_area
            )

    # ------------------------------------------------
    # Dataset-1 (Symptoms)
    # ------------------------------------------------
    dataset1_prob = predict_dataset1({
        "age": age,
        "gender": gender,
        "dysuria": dysuria,
        "abd_pain": abd_pain,
        "fever": fever,
        "polyuria": polyuria
    })

    # ------------------------------------------------
    # Dataset-2 (Clinical indicators)
    # ------------------------------------------------
    bladder_prob, renal_prob = predict_dataset2({
        "temperature": temperature,
        "nausea": nausea,
        "lumbar_pain": lumbar_pain,
        "urine_pushing": urine_pushing,
        "micturition_pain": micturition_pain,
        "urethral_burning": urethral_burning
    })

    # ------------------------------------------------
    # Fusion + Confidence
    # ------------------------------------------------
    final_uti, uti_type = fuse_decisions(
        image_uti=image_based_uti,
        dataset2_lower_prob=bladder_prob,
        dataset2_upper_prob=renal_prob,
        dataset1_prob=dataset1_prob,
        wbc_severity_score=wbc_sev_score,
        yeast_severity_score=yeast_sev_score
    )

    confidence_score = compute_confidence(
        image_uti=image_based_uti,
        dataset1_prob=dataset1_prob,
        dataset2_lower_prob=bladder_prob,
        dataset2_upper_prob=renal_prob,
        wbc_severity_score=wbc_sev_score,
        yeast_severity_score=yeast_sev_score
    )

    # ------------------------------------------------
    # Response
    # ------------------------------------------------
    return {
        "wbc_count": wbc_count,
        "yeast_count": yeast_count,
        "ecoli_present": ecoli_present,

        "segmentation_used": include_segmentation,
        "wbc_area": wbc_area,
        "yeast_area": yeast_area,
        "wbc_severity": wbc_severity_label,
        "yeast_severity": yeast_severity_label,

        "image_based_uti": image_based_uti,

        "dataset1_uti_probability": round(dataset1_prob, 3),
        "dataset2_bladder_probability": round(bladder_prob, 3),
        "dataset2_renal_probability": round(renal_prob, 3),

        "final_uti": final_uti,
        "uti_type": uti_type,
        "confidence_score": confidence_score
    }
