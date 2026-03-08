import os
import torch
import timm
from torchvision import transforms
from PIL import Image
import numpy as np

class RBCPipeline:
    def __init__(self):
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "rbc_iso_dys_effb3_best.pt")
        
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        ckpt = torch.load(model_path, map_location=self.device)
        self.img_size = ckpt.get("img_size", 300)
        
        self.class_to_idx = ckpt.get("class_to_idx", {'dysmorphic': 0, 'isomorphic': 1})
        self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}
        
        self.model = timm.create_model("efficientnet_b3", pretrained=False, num_classes=2)
        
        if "model_state" in ckpt:
            self.model.load_state_dict(ckpt["model_state"])
        else:
            self.model.load_state_dict(ckpt)
            
        self.model.to(self.device)
        self.model.eval()
        
        self.transform = transforms.Compose([
            transforms.Resize((self.img_size, self.img_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485,0.456,0.406], std=[0.229,0.224,0.225]),
        ])

    def process(self, image_np, detections):
        count = detections.get("count", 0)

        if count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": [],
                "subtype_summary": {
                    "isomorphic": 0,
                    "dysmorphic": 0
                },
                "risk_assessment": {
                    "dysmorphic_percentage": 0.0
                }
            }

        boxes = detections.get("boxes", [])
        
        crops = []
        for b in boxes:
            x1, y1, x2, y2 = b["bbox"]
            
            # Boundary protections protecting against float logic from YOLO mapping onto sliced matrices
            x1, y1 = max(0, int(x1)), max(0, int(y1))
            x2 = min(image_np.shape[1], int(x2))
            y2 = min(image_np.shape[0], int(y2))
            
            crop_np = image_np[y1:y2, x1:x2]
            
            if crop_np.shape[0] == 0 or crop_np.shape[1] == 0:
                dummy = Image.new("RGB", (self.img_size, self.img_size), color="black")
                crops.append(dummy)
            else:
                crops.append(Image.fromarray(crop_np))

        # Perform Batched prediction securely 
        tensor_batch = torch.stack([self.transform(crop) for crop in crops]).to(self.device)

        with torch.no_grad():
            logits = self.model(tensor_batch)
            probs = torch.softmax(logits, dim=1).cpu().numpy()

        enriched_boxes = []
        iso_count = 0
        dys_count = 0

        for i, b in enumerate(boxes):
            pred_idx = int(np.argmax(probs[i]))
            label = self.idx_to_class.get(pred_idx, "isomorphic")
            prob = float(probs[i][pred_idx])
            
            if label == "isomorphic":
                iso_count += 1
            elif label == "dysmorphic":
                dys_count += 1
                
            enriched_boxes.append({
                "bbox": b["bbox"],
                "confidence": b.get("confidence", 0.0),
                "subtype": label,
                "subtype_prob": round(prob, 4)
            })

        dys_percent = (dys_count / count) * 100 if count > 0 else 0.0

        return {
            "detected": True,
            "total_count": count,
            "boxes": enriched_boxes,
            "subtype_summary": {
                "isomorphic": iso_count,
                "dysmorphic": dys_count
            },
            "risk_assessment": {
                "dysmorphic_percentage": round(dys_percent, 2)
            }
        }
