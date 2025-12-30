import argparse
import os
import random
from dataclasses import dataclass
from typing import Any, Dict, Optional

import numpy as np
import torch
import yaml
from torch.utils.tensorboard import SummaryWriter


def set_seed(seed: int) -> None:
    """Set random seed for reproducibility."""
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


def get_device() -> torch.device:
    """Return CUDA device if available, else CPU."""
    return torch.device("cuda" if torch.cuda.is_available() else "cpu")


def load_yaml_config(path: str) -> Dict[str, Any]:
    """Load a YAML configuration file."""
    with open(path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def parse_args() -> argparse.Namespace:
    """Parse common command-line arguments."""
    parser = argparse.ArgumentParser(description="RBC Morphology Classification")
    parser.add_argument(
        "--config",
        type=str,
        required=True,
        help="Path to YAML configuration file.",
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=None,
        help="Path to model checkpoint (.pth) for evaluation or resuming training.",
    )
    return parser.parse_args()


def ensure_dir(path: str) -> None:
    """Create directory if it does not exist."""
    os.makedirs(path, exist_ok=True)


@dataclass
class ExperimentPaths:
    """Container for common experiment paths."""

    output_dir: str

    @property
    def checkpoints_dir(self) -> str:
        path = os.path.join(self.output_dir, "checkpoints")
        ensure_dir(path)
        return path

    @property
    def logs_dir(self) -> str:
        path = os.path.join(self.output_dir, "logs")
        ensure_dir(path)
        return path


def create_summary_writer(output_dir: str) -> Optional[SummaryWriter]:
    """Create a TensorBoard SummaryWriter if tensorboard is installed."""
    try:
        writer = SummaryWriter(log_dir=os.path.join(output_dir, "tb"))
    except Exception:
        writer = None
    return writer


def binary_accuracy_from_logits(
    logits: torch.Tensor, targets: torch.Tensor
) -> float:
    """Compute binary accuracy given raw logits and integer targets {0,1}."""
    with torch.no_grad():
        preds = (torch.sigmoid(logits) > 0.5).long()
        correct = (preds.view_as(targets) == targets).sum().item()
        total = targets.numel()
        return float(correct) / float(total) if total > 0 else 0.0


