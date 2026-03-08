import os
import cv2
import numpy as np
import tensorflow as tf

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from particles.crystal.predictor import CrystalPredictor

class CrystalPipeline:
    def __init__(self):
        self.class_names = ['CaOx_Dihydrate', 'CaOx_Monohydrate', 'Phosphate', 'Uric_Acid']
        self.img_height = 224
        self.img_width = 224
        self.model = None
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "crystals", "efficientnet_crystals_best_v2.keras")
        
        if not os.path.exists(model_path):
            print(f"WARNING: Crystal classifier model not found at: {model_path}")
        else:
            try:
                self.model = tf.keras.models.load_model(model_path)
            except Exception as e:
                print(f"WARNING: Failed to load crystal classifier model: {e}")
                self.model = None
            
        self.predictor = CrystalPredictor()

    def preprocess(self, img_array):
        # Convert BGR to RGB (assuming img_array from cv2 imread)
        # Note: In detector we used cv2 imdecode which returns BGR
        img_rgb = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
        
        # Resize to target size
        img_resized = cv2.resize(img_rgb, (self.img_width, self.img_height))
        
        # Expand dims to create batch of 1
        img_batch = np.expand_dims(img_resized, axis=0)
        
        # Preprocess input using EfficientNet preprocessing
        img_preprocessed = tf.keras.applications.efficientnet.preprocess_input(img_batch)
        
        return img_preprocessed

    def classify(self, img_array):
        if img_array is None or img_array.size == 0:
            return {'class': 'Unknown', 'confidence': 0.0}
        
        if self.model is None:
            return {'class': 'Unknown', 'confidence': 0.0}

        preprocessed_img = self.preprocess(img_array)
        
        # Predict
        predictions = self.model.predict(preprocessed_img, verbose=0)
        score = tf.nn.softmax(predictions[0])
        
        class_idx = np.argmax(score)
        confidence = float(np.max(score))
        predicted_class = self.class_names[class_idx]
        
        return {
            'class': predicted_class,
            'confidence': confidence
        }

    def process(self, image_np: np.ndarray, detections: dict):
        # Initialize counts
        counts = {
            "calcium_oxalate": 0,
            "uric_acid": 0,
            "calcium_phosphate": 0,
            "struvite": 0,
            "cystine": 0,
            "other": 0
        }
        
        enriched_boxes = []
        
        for det in detections.get("boxes", []):
            x1, y1, x2, y2 = det["bbox"]
            
            # Bound checking
            h, w = image_np.shape[:2]
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w, x2), min(h, y2)
            
            crop_np = image_np[y1:y2, x1:x2]
            
            if crop_np.size == 0:
                enriched_boxes.append(det)
                continue
                
            # Classify
            classification = self.classify(crop_np)
            cls_name = classification["class"]
            
            # Map class names to standardized keys
            if "CaOx" in cls_name:
                counts["calcium_oxalate"] += 1
            elif "Uric_Acid" in cls_name:
                counts["uric_acid"] += 1
            elif "Phosphate" in cls_name:
                counts["calcium_phosphate"] += 1
            elif "Struvite" in cls_name:
                counts["struvite"] += 1
            elif "Cystine" in cls_name:
                counts["cystine"] += 1
            else:
                counts["other"] += 1
            
            enriched_box = dict(det)
            enriched_box["subtype"] = cls_name
            enriched_boxes.append(enriched_box)
            
        total_crystals = sum(counts.values())
        
        if total_crystals == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }
        
        # Clean counts map for return (remove 0 entries if desired, but user example implies full map or counts dict is fine)
        # Process disease risk rules
        prediction = self.predictor.predict(counts, total_crystals)
        
        return {
            "detected": True,
            "total_count": total_crystals,
            "boxes": enriched_boxes,
            "subtype_summary": counts,
            "risk_assessment": {
                "level": prediction["stone_risk_level"],
                "clinical_suggestion": prediction["clinical_suggestion"]
            }
        }
