"""
EfficientNet-B2 training script
Binary classification: Isomorphic vs Dysmorphic RBCs
Dataset path expected in Google Drive (not included in repo)
"""




import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import timm
import os

# =====================
# PATHS
# =====================
DATA_DIR = "/content/drive/MyDrive/RBC_Hematuria_AI_Research/data/rbc_cells"
MODEL_DIR = "/content/drive/MyDrive/RBC_Hematuria_AI_Research/models"
os.makedirs(MODEL_DIR, exist_ok=True)

# =====================
# TRAINING PARAMS
# =====================
IMG_SIZE = 260        # EfficientNet-B2
BATCH_SIZE = 16
EPOCHS = 20
LR = 1e-4
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# =====================
# TRANSFORMS
# =====================
train_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.RandomHorizontalFlip(),
    transforms.RandomRotation(15),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

# =====================
# DATASETS
# =====================
train_ds = datasets.ImageFolder(f"{DATA_DIR}/train", transform=train_tf)
val_ds   = datasets.ImageFolder(f"{DATA_DIR}/val", transform=val_tf)
test_ds  = datasets.ImageFolder(f"{DATA_DIR}/test", transform=val_tf)

train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True)
val_loader   = DataLoader(val_ds, batch_size=BATCH_SIZE)
test_loader  = DataLoader(test_ds, batch_size=BATCH_SIZE)

print("Class mapping:", train_ds.class_to_idx)  # iso=0, dys=1

# =====================
# MODEL
# =====================
model = timm.create_model(
    "efficientnet_b2",
    pretrained=True,
    num_classes=1
)
model.to(DEVICE)

criterion = nn.BCEWithLogitsLoss()
optimizer = torch.optim.Adam(model.parameters(), lr=LR)

best_recall = 0.0

# =====================
# TRAIN LOOP
# =====================
for epoch in range(EPOCHS):
    model.train()
    running_loss = 0.0

    for x, y in train_loader:
        x = x.to(DEVICE)
        y = y.float().to(DEVICE)

        optimizer.zero_grad()
        logits = model(x).squeeze()
        loss = criterion(logits, y)
        loss.backward()
        optimizer.step()

        running_loss += loss.item()

    # ===== VALIDATION (Recall)
    model.eval()
    tp = fn = 0

    with torch.no_grad():
        for x, y in val_loader:
            x = x.to(DEVICE)
            y = y.to(DEVICE)
            preds = (torch.sigmoid(model(x).squeeze()) > 0.5).int()
            tp += ((preds == 1) & (y == 1)).sum().item()
            fn += ((preds == 0) & (y == 1)).sum().item()

    recall = tp / (tp + fn + 1e-8)

    print(f"Epoch {epoch+1:02d}/{EPOCHS} | "
          f"Loss {running_loss:.4f} | "
          f"Val Recall {recall:.4f}")

    if recall > best_recall:
        best_recall = recall
        torch.save(
            model.state_dict(),
            f"{MODEL_DIR}/efficientnet_b2_best.pth"
        )
        print("✅ Best model saved")

print("\nTraining complete")
print("Best Validation Recall:", best_recall)
