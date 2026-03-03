import torch
import timm

model = timm.create_model("efficientnet_b2", pretrained=False, num_classes=1)
state = torch.load("weights/efficientnet_b2_best.pth", map_location="cpu")
model.load_state_dict(state)

print("✅ Model loaded successfully")
