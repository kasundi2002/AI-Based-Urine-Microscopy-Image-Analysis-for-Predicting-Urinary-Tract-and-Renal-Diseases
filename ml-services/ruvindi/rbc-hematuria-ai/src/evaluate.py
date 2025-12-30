from typing import Dict, Any

import torch
import torch.nn as nn
from tqdm import tqdm

from .dataset import build_dataloaders
from .model import RBCClassifier
from .utils import (
    binary_accuracy_from_logits,
    get_device,
    load_yaml_config,
    parse_args,
    set_seed,
)


def evaluate_split(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    device: torch.device,
) -> Dict[str, float]:
    model.eval()
    running_acc = 0.0
    total = 0
    all_logits = []
    all_targets = []

    with torch.no_grad():
        for images, targets in tqdm(loader, desc="Eval", leave=False):
            images = images.to(device)
            targets = targets.to(device)

            logits = model(images)
            acc = binary_accuracy_from_logits(logits, targets.long())

            batch_size = targets.size(0)
            running_acc += acc * batch_size
            total += batch_size

            all_logits.append(logits.cpu())
            all_targets.append(targets.cpu())

    overall_acc = running_acc / total if total > 0 else 0.0
    return {"acc": overall_acc}


def main() -> None:
    args = parse_args()
    cfg: Dict[str, Any] = load_yaml_config(args.config)

    if args.checkpoint is None:
        raise ValueError("Please provide --checkpoint for evaluation.")

    seed = int(cfg.get("seed", 42))
    set_seed(seed)
    device = get_device()

    data_cfg = cfg["data"]
    # Reuse validation loader as an evaluation split by default
    _, val_loader = build_dataloaders(
        data_root=data_cfg["root"],
        image_size=int(data_cfg.get("image_size", 224)),
        batch_size=int(cfg["training"].get("batch_size", 16)),
        num_workers=int(data_cfg.get("num_workers", 4)),
    )

    model_cfg = cfg["model"]
    model = RBCClassifier(
        variant=model_cfg.get("variant", "b0"),
        pretrained=False,  # weights will be loaded from checkpoint
    ).to(device)

    state = torch.load(args.checkpoint, map_location=device)
    model.load_state_dict(state["model_state_dict"])

    metrics = evaluate_split(model=model, loader=val_loader, device=device)
    print(f"Validation accuracy: {metrics['acc']:.4f}")


if __name__ == "__main__":
    main()


