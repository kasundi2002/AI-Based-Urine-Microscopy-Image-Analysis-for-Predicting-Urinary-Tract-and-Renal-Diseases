
import json
import os
import sys
import cv2

# Ensure the current directory is in python path to handle relative imports if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import traceback

try:
    from detect import CrystalDetector
    from classify import CrystalClassifier
except Exception as e:
    with open("python_error.log", "w") as f:
        f.write(f"Import Error:\n{traceback.format_exc()}")
    print(f"CRITICAL PIPELINE ERROR: {e}")
    print(traceback.format_exc())
    sys.exit(1)

# Configuration
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) # points to backend/
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
CLASSIFIER_MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_crystals_best_v2.keras")

class UrineCrystalPipeline:
    def __init__(self, yolo_path, classifier_path):
        """
        Initialize the AI pipeline.
        """
        try:
            self.detector = CrystalDetector(yolo_path)
        except Exception as e:
            print(f"Error loading detector: {e}", file=sys.stderr)
            self.detector = None

        try:
            self.classifier = CrystalClassifier(classifier_path)
        except Exception as e:
            print(f"Error loading classifier: {e}", file=sys.stderr)
            self.classifier = None

    def process_image(self, image_path):
        """
        Run the full pipeline on a single image.
        
        Args:
            image_path (str): Path to the image file.
            
        Returns:
            dict: Results containing detection and classification details.
        """
        result_payload = {
            "image": image_path,
            "crystals": [],
            "status": "success",
            "error": None
        }

        if not self.detector or not self.classifier:
            result_payload["status"] = "error"
            result_payload["error"] = "Models not initialized correctly."
            return result_payload

        try:
            # 1. Detect
            detections, original_img = self.detector.detect(image_path)
            
            # Initialize counters
            counts = {
                "calcium_oxalate": 0,
                "uric_acid": 0,
                "calcium_phosphate": 0,
                "struvite": 0,
                "cystine": 0,
                "other": 0
            }
            
            # 2. Process each detection
            for det in detections:
                x1, y1, x2, y2 = det['box']
                
                # Check bounds
                h, w, _ = original_img.shape
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w, x2), min(h, y2)
                
                # 3. Crop
                if x2 > x1 and y2 > y1:
                    crop = original_img[y1:y2, x1:x2]
                    
                    # 4. Classify
                    classification = self.classifier.classify(crop)
                    
                    # Update counts
                    cls_name = classification['class']
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

                    # 5. Aggregate
                    crystal_result = {
                        "bbox": [x1, y1, x2, y2],
                        "detection_confidence": det['conf'],
                        "detection_class": det['class_name'], # YOLO class (could be generic 'crystal')
                        "classification": classification['class'], # EfficientNet specific class
                        "classification_confidence": classification['confidence'],
                        "all_class_probabilities": classification['probabilities']
                    }
                    result_payload["crystals"].append(crystal_result)
            
            # Calculate Risk Level
            total_crystals = sum(counts.values())
            result_payload["crystal_count"] = total_crystals
            
            # Add specific counts to payload
            for k, v in counts.items():
                if v > 0: # Only add non-zero counts to keep it clean, or add all if preferred. User example showed specific keys.
                     result_payload[k] = v
                else:
                     result_payload[k] = 0

            # Determine Risk
            if total_crystals >= 5:
                result_payload["stone_risk_level"] = "High"
            elif total_crystals >= 3:
                result_payload["stone_risk_level"] = "Moderate"
            else:
                result_payload["stone_risk_level"] = "Low"

            # Clinical Suggestion
            if total_crystals == 0:
                result_payload["clinical_suggestion"] = "No crystals detected. Maintain normal hydration."
            else:
                # Find dominant type
                dominant_type = max(counts, key=counts.get)
                if dominant_type == "calcium_oxalate":
                    result_payload["clinical_suggestion"] = "Increased risk of calcium oxalate stone formation. Consider increasing fluid intake and reducing dietary oxalate."
                elif dominant_type == "uric_acid":
                    result_payload["clinical_suggestion"] = "Signs of acidic urine. Suggest hydration and alkalization therapy."
                elif dominant_type == "calcium_phosphate":
                    result_payload["clinical_suggestion"] = "Associated with alkaline urine. Check for underlying metabolic causes."
                elif dominant_type == "struvite":
                     result_payload["clinical_suggestion"] = "Strong association with urinary tract infections. Antibiotic treatment may be required."
                else:
                    result_payload["clinical_suggestion"] = "Crystals detected. Consult a nephrologist for further analysis."

        except Exception as e:
            result_payload["status"] = "error"
            result_payload["error"] = str(e)
            
        return result_payload

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path provided"}))
        return

    image_path = sys.argv[1]
    
    # Use environment variables or default paths
    yolo_path = os.getenv("YOLO_PATH", YOLO_MODEL_PATH)
    classifier_path = os.getenv("CLASSIFIER_PATH", CLASSIFIER_MODEL_PATH)
    
    # Check if models exist (mocking existence for code generation unless files are actually present)
    # in a real run, these files must exist.
    
    try:
        pipeline = UrineCrystalPipeline(yolo_path, classifier_path)
        results = pipeline.process_image(image_path)
        print(json.dumps(results, indent=2))
    except Exception as e:
        with open("python_error.log", "w") as f:
            f.write(f"Runtime Error:\n{traceback.format_exc()}")
        # Still return a valid JSON error for the backend
        print(json.dumps({"status": "error", "error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
