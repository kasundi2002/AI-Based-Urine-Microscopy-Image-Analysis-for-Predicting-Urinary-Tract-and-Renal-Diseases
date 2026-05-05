from fastapi import FastAPI, UploadFile, File
import io
import numpy as np
from PIL import Image
from pydantic import BaseModel

from core.particle_registry import get_particles
from diagnosis.diagnosis_engine import DiagnosisEngine
from clinical_ml.uti_pipeline import run_uti_ml

app = FastAPI()

# Initialize particles once at startup
particles = get_particles()
diagnosis_engine = DiagnosisEngine()

class UTIRequest(BaseModel):
    particle_features: dict
    questionnaire_answers: dict

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    particle_response = {}
    image_np = None
    
    # loop over particles dynamically
    for particle in particles:
        detection = particle["detector"].detect(image_bytes)
        
        if detection.get("count", 0) > 0 and "pipeline" in particle:
            if image_np is None:
                image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                image_np = np.array(image)
            pipeline_result = particle["pipeline"].process(image_np, detection)
            particle_response[particle["name"]] = pipeline_result
        else:
            particle_response[particle["name"]] = {
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

@app.post("/analyze-uti")
async def analyze_uti(request: UTIRequest):
    return run_uti_ml(request.particle_features, request.questionnaire_answers)
