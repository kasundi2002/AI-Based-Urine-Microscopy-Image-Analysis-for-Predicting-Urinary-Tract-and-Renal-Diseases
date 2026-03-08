import numpy as np
import cv2
from PIL import Image
from particles.bacteria.detector import BacteriaDetector, EcoliClassifier
from particles.bacteria.predictor import BacteriaPredictor


class BacteriaPipeline:
    """Two-stage pipeline: detect bacteria particles, then classify each as E.coli or not"""
    
    def __init__(self):
        self.ecoli_classifier = EcoliClassifier()
        self.predictor = BacteriaPredictor()

    def process(self, image_np: np.ndarray, detections: dict) -> dict:
        """Process detected bacteria particles through E.coli classification
        
        Args:
            image_np: Numpy array of the image (BGR format)
            detections: Dict with 'count' and 'boxes' from BacteriaDetector.detect()
            
        Returns:
            dict with classification results and risk assessment
        """
        # Stage 2: Classify each detected particle
        classified_particles = []
        ecoli_count = 0
        other_bacteria_count = 0
        
        for box_info in detections.get("boxes", []):
            bbox = box_info["bbox"]
            x1, y1, x2, y2 = bbox
            
            # Extract particle region
            particle_region = image_np[y1:y2, x1:x2]
            
            # Convert from RGB (if needed) to RGB for PIL
            if particle_region.shape[2] == 3:
                # Assume BGR, convert to RGB
                particle_image = Image.fromarray(cv2.cvtColor(particle_region, cv2.COLOR_BGR2RGB))
            else:
                particle_image = Image.fromarray(particle_region)
            
            # Classify particle
            classification = self.ecoli_classifier.classify(particle_image)
            
            if classification["is_ecoli"]:
                ecoli_count += 1
            else:
                other_bacteria_count += 1
            
            classified_particles.append({
                "bbox": bbox,
                "detection_confidence": box_info["confidence"],
                "classification": classification
            })
        
        # Aggregate results
        risk_level = self.predictor.assess(ecoli_count > 0)
        
        return {
            "detected": detections.get("count", 0) > 0,
            "total_particles_detected": detections.get("count", 0),
            "ecoli_count": ecoli_count,
            "other_bacteria_count": other_bacteria_count,
            "classified_particles": classified_particles,
            "boxes": detections.get("boxes", []),
            "risk_assessment": {"level": risk_level}
        }
