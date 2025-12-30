from typing import Literal

import torch
import torch.nn as nn
from efficientnet_pytorch import EfficientNet


def build_efficientnet_backbone(
    variant: Literal["b0", "b2", "b4"] = "b0", pretrained: bool = True
) -> EfficientNet:
    """Create an EfficientNet backbone."""
    model_name = f"efficientnet-{variant}"
    backbone = EfficientNet.from_pretrained(model_name) if pretrained else EfficientNet.from_name(model_name)
    return backbone


class RBCClassifier(nn.Module):
    """EfficientNet-based binary classifier for RBC morphology."""

    def __init__(
        self,
        variant: Literal["b0", "b2", "b4"] = "b0",
        pretrained: bool = True,
    ) -> None:
        super().__init__()
        self.backbone = build_efficientnet_backbone(variant=variant, pretrained=pretrained)
        in_features = self.backbone._fc.in_features
        # Replace the classification head with a simple binary head
        self.backbone._fc = nn.Linear(in_features, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # Returns raw logits of shape (batch_size, 1)
        return self.backbone(x).squeeze(1)


