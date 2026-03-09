import numpy as np
import cv2
from PIL import Image
from particles.bacteria.detector import EcoliClassifier
from particles.bacteria.predictor import BacteriaPredictor


class BacteriaPipeline:
    """Two-stage pipeline: detect bacteria, then classify as E.coli or not."""

    def __init__(self):
        self.ecoli_classifier = EcoliClassifier()
        self.predictor = BacteriaPredictor()

    def process(self, image_np: np.ndarray, detections: dict) -> dict:
        classified_particles = []
        ecoli_count = 0
        other_bacteria_count = 0

        for box_info in detections.get("boxes", []):
            bbox = box_info["bbox"]
            x1, y1, x2, y2 = [int(v) for v in bbox]

            particle_region = image_np[y1:y2, x1:x2]
            if particle_region.size == 0:
                continue

            if particle_region.shape[2] == 3:
                particle_image = Image.fromarray(cv2.cvtColor(particle_region, cv2.COLOR_BGR2RGB))
            else:
                particle_image = Image.fromarray(particle_region)

            classification = self.ecoli_classifier.classify(particle_image)

            if classification["is_ecoli"]:
                ecoli_count += 1
            else:
                other_bacteria_count += 1

            classified_particles.append({
                "bbox": bbox,
                "detection_confidence": box_info.get("confidence", 0.0),
                "classification": classification
            })

        risk_level = self.predictor.assess(ecoli_count > 0)

        return {
            "detected": detections.get("count", 0) > 0,
            "total_count": detections.get("count", 0),
            "ecoli_count": ecoli_count,
            "other_bacteria_count": other_bacteria_count,
            "classified_particles": classified_particles,
            "boxes": detections.get("boxes", []),
            "risk_assessment": {"level": risk_level}
        }
