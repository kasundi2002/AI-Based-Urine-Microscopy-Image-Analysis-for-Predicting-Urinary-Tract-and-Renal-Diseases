import cv2
from PIL import Image
from particles.rbc.classifier import RBCClassifier
from particles.rbc.predictor import RBCPredictor

class RBCPipeline:
    def __init__(self):
        # Heavy class instances loading once natively
        self.classifier = RBCClassifier()
        self.predictor = RBCPredictor()

    def process(self, image_np, detections):
        count = detections.get("count", 0)

        if count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }

        boxes = detections.get("boxes", [])
        
        # 1. Batch Slice the bounding box coordinates into sub-images
        crops = []
        for b in boxes:
            x1, y1, x2, y2 = b["bbox"]
            
            # Clip variables against matrix limits automatically resolving invalid cv2 contours out of bounds
            x1, y1 = max(0, x1), max(0, y1)
            x2 = min(image_np.shape[1], x2)
            y2 = min(image_np.shape[0], y2)
            
            crop_np = image_np[y1:y2, x1:x2]
            
            if crop_np.shape[0] == 0 or crop_np.shape[1] == 0:
                # Prevent invalid scaling dimension 0 sizes breaking PIL
                dummy = Image.new("RGB", (260, 260), color="black")
                crops.append(dummy)
            else:
                crops.append(Image.fromarray(crop_np))

        # 2. Run batched model payload resolving directly to lists
        predictions = self.classifier.classify_batch(crops)

        enriched_boxes = []
        iso_count = 0
        dys_count = 0

        # 3. Zip findings dynamically into detection payload properties
        for i, b in enumerate(boxes):
            label, prob = predictions[i] if i < len(predictions) else ("iso", 1.0)
            
            # Aggregate totals iteratively
            if label == "iso":
                iso_count += 1
            else:
                dys_count += 1
                
            enriched_boxes.append({
                "bbox": b["bbox"],
                "confidence": b.get("confidence", 0.99), # OpenCV does not assign conf 
                "subtype": label,
                "subtype_prob": prob
            })

        # 4. Synthesize diagnostic risk arrays directly 
        risk_assessment = self.predictor.compute_summary(predictions)

        subtype_counts = {
            "iso": iso_count,
            "dys": dys_count
        }

        return {
            "detected": True,
            "total_count": count,
            "boxes": enriched_boxes,
            "subtype_summary": subtype_counts,
            "risk_assessment": risk_assessment
        }
