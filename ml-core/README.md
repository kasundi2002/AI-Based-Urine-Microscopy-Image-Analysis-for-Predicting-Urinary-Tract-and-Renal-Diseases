# ML Core

This package contains the unified machine-learning core used across the project.

## Structure

- `core/` – shared logic and utilities
  - `base_detector.py` – parent class for image detectors
  - `particle_registry.py` – list of image-based particles (casts, crystals, wbc, yeast, bacteria)
  - `uti_rules.py`, `fusion.py`, `severity.py` – rule engines and fusion logic moved outside of particles
  - `clinical_dataset1.py`, `clinical_dataset2.py` – wrappers for clinical models (logistic regression)

- `particles/` – per-particle directories containing `detector.py`, `pipeline.py`, `predictor.py`
  - each subpackage handles a single microscopic object type (see `wbc`, `yeast`, `bacteria`, etc.)

- `models/` – pretrained weights required by detectors and clinical models

- `main.py` – FastAPI application demonstrating how to run the particles and metadata pipelines.

## Running

```powershell
cd ml-core
pip install -r requirements.txt   # create as needed with dependencies: fastapi, uvicorn, numpy, pillow, torch, ultralytics, sklearn, timm
uvicorn main:app --reload
```

Endpoints:

- `POST /analyze-image` – supply a microscopy image; returns results from each particle.
- `POST /analyze-with-metadata` – supply image and optional clinical/symptom fields; runs fusion logic.

## Notes

Severity, fusion and rule-based logic are intentionally *not* particles. They operate on outputs from particle detectors and elsewhere.
Clinical dataset models likewise live inside `core/` rather than the particle hierarchy.
