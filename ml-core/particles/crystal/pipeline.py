import os
import cv2
import numpy as np
import tensorflow as tf

import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

class CrystalPipeline:
    def __init__(self):
        self.class_names = ['CaOx_Dihydrate', 'CaOx_Monohydrate', 'Phosphate', 'Uric_Acid']
        self.img_height = 224
        self.img_width = 224
        
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(base_dir, "models", "efficientnet_crystals_best_v2.keras")
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Classifier model not found at: {model_path}")
            
        try:
            self.model = tf.keras.models.load_model(model_path)
        except Exception as e:
            raise RuntimeError(f"Failed to load classifier model: {e}")

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
        # Initialize counts using actual ML class names
        counts = {
            "CaOx_Dihydrate": 0,
            "CaOx_Monohydrate": 0,
            "Phosphate": 0,
            "Uric_Acid": 0
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
            
            # Increment count for the classified type
            if cls_name in counts:
                counts[cls_name] += 1
            
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
        
        return {
            "detected": True,
            "total_count": total_crystals,
            "boxes": enriched_boxes,
            "subtype_summary": counts
        }
