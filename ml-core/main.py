from fastapi import FastAPI, UploadFile, File
import io
import numpy as np
from PIL import Image
from core.particle_registry import get_particles

app = FastAPI()

# Initialize particles once at startup
particles = get_particles()

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    response = {}
    image_np = None
    
    # loop over particles dynamically
    for particle in particles:
        detection = particle["detector"].detect(image_bytes)
        
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
            
    return response
