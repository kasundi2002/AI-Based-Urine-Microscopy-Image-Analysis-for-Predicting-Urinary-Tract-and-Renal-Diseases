import os
import torch
import timm
from torchvision import transforms

class RBCClassifier:
    def __init__(self):
        # Determine paths natively integrating ML core hierarchy  
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        model_path = os.path.join(base_dir, "models", "efficientnet_b3_best.pth")

        # PyTorch hardware matching
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        # Initalize timm model identically matching initial weights layer structure     
        self.model = timm.create_model("efficientnet_b3", pretrained=False, num_classes=1)
        self.model.load_state_dict(torch.load(model_path, map_location=self.device))
        self.model.to(self.device)
        self.model.eval()

        # Batch pipeline mapping
        self.transform = transforms.Compose([
            transforms.Resize((260, 260)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])

    def classify_batch(self, crop_images_list):
        """
        Arguments:
            crop_images_list: List of PIL.Image frames cropped out by cv2 inference output
        Returns:
            list of tuple variants: [ ("iso", prob), ("dys", prob) ]
        """
        if len(crop_images_list) == 0:
            return []

        # Vectorized scaling mapping to batch tensors (B, C, H, W)
        tensor_batch = torch.stack([self.transform(crop) for crop in crop_images_list]).to(self.device)

        # Batch forward pass loop-avoiding 
        with torch.no_grad():
            logits = self.model(tensor_batch)
            probs = torch.sigmoid(logits).squeeze(-1).cpu().numpy()

        results = []
        # Support variable batch size scaling appropriately 
        if probs.ndim == 0: 
            probs = [probs.item()]

        for prob in probs:
            label = "dys" if prob >= 0.5 else "iso"
            results.append((label, round(float(prob), 4)))

        return results
