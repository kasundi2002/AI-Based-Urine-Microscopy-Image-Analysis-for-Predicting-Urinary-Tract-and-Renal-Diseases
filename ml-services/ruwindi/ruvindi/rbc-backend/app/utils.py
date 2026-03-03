from torchvision import transforms
from PIL import Image

transform = transforms.Compose([
    transforms.Resize((260, 260)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])

def preprocess_image(img: Image.Image):
    return transform(img).unsqueeze(0)
