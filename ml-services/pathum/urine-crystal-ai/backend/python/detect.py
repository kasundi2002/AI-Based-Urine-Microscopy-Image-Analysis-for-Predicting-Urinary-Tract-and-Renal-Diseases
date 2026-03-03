
import cv2
from ultralytics import YOLO
import os

class CrystalDetector:
    def __init__(self, model_path):
        """
        Initialize the YOLOv11 detector.
        
        Args:
            model_path (str): Path to the YOLOv11 .pt model file.
        """
        self.model_path = model_path
        # Check if model file exists to avoid obscure errors later
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"YOLO model not found at: {model_path}")
            
        # print(f"Loading YOLO model from {model_path}...")
        self.model = YOLO(model_path)
        # print("YOLO model loaded successfully.")

    def detect(self, image_path, conf_threshold=0.25):
        """
        Run object detection on an image.

        Args:
            image_path (str): Path to the input image.
            conf_threshold (float): Confidence threshold for detections.

        Returns:
            list: A list of dictionaries, each containing:
                - 'box': (x1, y1, x2, y2)
                - 'conf': confidence score
                - 'class_id': class ID
                - 'class_name': class name
            image: The original loaded image (numpy array) for cropping.
        """
        # Load image using OpenCV
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image at {image_path}")

        # Run inference
        results = self.model(img, conf=conf_threshold)
        
        detections = []
        
        # Process results
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                
                # Confidence
                conf = box.conf[0].item()
                
                # Class
                cls = int(box.cls[0].item())
                if result.names:
                    class_name = result.names[cls]
                else:
                    class_name = str(cls)

                detections.append({
                    'box': (int(x1), int(y1), int(x2), int(y2)),
                    'conf': conf,
                    'class_id': cls,
                    'class_name': class_name
                })
                
        return detections, img

if __name__ == "__main__":
    # Test block
    import os
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
    # Placeholder for testing, in a real scenario input a valid image path
    print(f"Detector initialized with model: {MODEL_PATH}")
