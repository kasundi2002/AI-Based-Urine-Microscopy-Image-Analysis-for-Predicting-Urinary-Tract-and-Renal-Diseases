from fastapi import FastAPI, UploadFile, File
from app.yolo_service import run_yolo

app = FastAPI(title="Urinary Cast YOLO Service")

@app.get("/")
def health_check():
    return {"status": "YOLO backend running"}

@app.post("/detect-casts/")
async def detect_casts(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = run_yolo(image_bytes)
    return result
