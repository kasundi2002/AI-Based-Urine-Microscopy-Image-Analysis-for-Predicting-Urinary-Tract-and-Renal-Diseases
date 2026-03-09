from fastapi import FastAPI, UploadFile, File, Form
import io
import numpy as np
from PIL import Image
from core.particle_registry import get_particles
from diagnosis.diagnosis_engine import DiagnosisEngine
from diseases.uti.uti_rules import decide_uti
from diseases.uti.fusion import fuse_decisions, compute_confidence
from diseases.uti.clinical_dataset1 import ClinicalDataset1Model
from diseases.uti.clinical_dataset2 import ClinicalDataset2Model

app = FastAPI()

# Initialize particles once at startup
particles = get_particles()

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """Run detection pipelines for image-based particles only.

    This endpoint is effectively equivalent to the old kasundi `/predict` route.
    It will iterate over every registered particle that provides a ``detector``
    implementation, perform inference on the supplied image bytes, and then
    (when a pipeline exists) post-process the raw detection output.
    """

    image_bytes = await file.read()
    response = {}
    image_np = None

    for particle in particles:
        detector = particle.get("detector")
        if detector is None:
            # skip non-image particles
            continue

        detection = detector.detect(image_bytes)
        if detection.get("count", 0) > 0 and "pipeline" in particle:
            if image_np is None:
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                image_np = np.array(image)
            pipeline_result = particle["pipeline"].process(image_np, detection)
            response[particle["name"]] = pipeline_result
        else:
            response[particle["name"]] = {
                "detected": detection.get("count", 0) > 0,
                "total_count": detection.get("count", 0),
                "boxes": detection.get("boxes", [])
            }
            
    # Global Diagnosis execution ONCE after all particles processed
    diagnosis_result = diagnosis_engine.process(particle_response)

    return {
        "particles": particle_response,
        "diagnosis": diagnosis_result
    }


@app.post("/analyze-with-metadata")
async def analyze_with_metadata(
    file: UploadFile = File(...),
    age: int = Form(None),
    gender: int = Form(None),
    dysuria: int = Form(None),
    abd_pain: int = Form(None),
    fever: int = Form(None),
    polyuria: int = Form(None),
    temperature: float = Form(None),
    nausea: int = Form(None),
    lumbar_pain: int = Form(None),
    urine_pushing: int = Form(None),
    micturition_pain: int = Form(None),
    urethral_burning: int = Form(None),
    include_segmentation: bool = Form(False),
):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    image_np = np.array(image)
    image_area = image_np.shape[0] * image_np.shape[1]

    particle_response = {}
    results = {}

    for particle in particles:
        detection = particle["detector"].detect(image_bytes)

        if detection.get("count", 0) > 0 and "pipeline" in particle:
            pipeline_result = particle["pipeline"].process(image_np, detection)
            particle_response[particle["name"]] = pipeline_result
        else:
            particle_response[particle["name"]] = {
                "detected": detection.get("count", 0) > 0,
                "total_count": detection.get("count", 0),
                "boxes": detection.get("boxes", [])
            }

    results["particles"] = particle_response
    results["diagnosis"] = diagnosis_engine.process(particle_response)

    wbc_count = particle_response.get("wbc", {}).get("total_count", 0)
    yeast_count = particle_response.get("yeast", {}).get("total_count", 0)
    bacteria_data = particle_response.get("bacteria", {})
    ecoli_present = bacteria_data.get("ecoli_count", 0) > 0

    uti_decision = decide_uti(
        wbc_count=wbc_count,
        yeast_count=yeast_count,
        ecoli_present=ecoli_present,
    )
    results["uti_rules"] = {"uti": uti_decision}

    if include_segmentation:
        results["severity"] = {"mask_area": 0, "image_area": image_area, "normalized": 0.0}

    dataset1_meta = {
        k: v for k, v in {
            "age": age,
            "gender": gender,
            "dysuria": dysuria,
            "abd_pain": abd_pain,
            "fever": fever,
            "polyuria": polyuria,
        }.items() if v is not None
    }

    if dataset1_meta:
        model1 = ClinicalDataset1Model()
        results["clinical_dataset1"] = {"probability": model1.predict(dataset1_meta)}

    dataset2_meta = {
        k: v for k, v in {
            "temperature": temperature,
            "nausea": nausea,
            "lumbar_pain": lumbar_pain,
            "urine_pushing": urine_pushing,
            "micturition_pain": micturition_pain,
            "urethral_burning": urethral_burning,
        }.items() if v is not None
    }

    if dataset2_meta:
        model2 = ClinicalDataset2Model()
        bladder_prob, renal_prob = model2.predict(dataset2_meta)
        results["clinical_dataset2"] = {
            "bladder_probability": bladder_prob,
            "renal_probability": renal_prob
        }

    fusion_input = {
        "image_uti": uti_decision,
        "dataset1_prob": results.get("clinical_dataset1", {}).get("probability", 0.0),
        "dataset2_lower_prob": results.get("clinical_dataset2", {}).get("bladder_probability", 0.0),
        "dataset2_upper_prob": results.get("clinical_dataset2", {}).get("renal_probability", 0.0),
        "wbc_severity_score": results.get("severity", {}).get("normalized", 0.0),
        "yeast_severity_score": results.get("severity", {}).get("normalized", 0.0),
    }

    final_decision, uti_type = fuse_decisions(**fusion_input)
    confidence_score = compute_confidence(**fusion_input)
    results["fusion"] = {
        "final_uti": final_decision,
        "uti_type": uti_type,
        "confidence_score": confidence_score
    }

    return results
