from typing import Tuple

from torchvision import datasets, transforms
from torch.utils.data import DataLoader


def build_transforms(image_size: int = 224, is_train: bool = True):
    """Return torchvision transforms for training or evaluation."""
    if is_train:
        return transforms.Compose(
            [
                transforms.Resize((image_size, image_size)),
                transforms.RandomHorizontalFlip(),
                transforms.RandomRotation(10),
                transforms.ColorJitter(
                    brightness=0.1, contrast=0.1, saturation=0.1, hue=0.02
                ),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
            ]
        )
    return transforms.Compose(
        [
            transforms.Resize((image_size, image_size)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5]),
        ]
    )


def build_dataloaders(
    data_root: str,
    image_size: int,
    batch_size: int,
    num_workers: int = 4,
) -> Tuple[DataLoader, DataLoader]:
    """
    Build training and validation DataLoaders using ImageFolder structure.

    Expected directory layout:
        data_root/
            train/
              iso/
              dys/
            val/
              iso/
              dys/
    """
    train_dir = f"{data_root}/train"
    val_dir = f"{data_root}/val"

    train_dataset = datasets.ImageFolder(
        root=train_dir, transform=build_transforms(image_size, is_train=True)
    )
    val_dataset = datasets.ImageFolder(
        root=val_dir, transform=build_transforms(image_size, is_train=False)
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=num_workers,
        pin_memory=True,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True,
    )

    return train_loader, val_loader



