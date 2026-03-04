from fastapi import FastAPI
from app.api.inference import router as inference_router

app = FastAPI(title="UTI Microscopy Backend")

app.include_router(inference_router)

@app.get("/")
def health():
    return {"status": "Backend running"}
