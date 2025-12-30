from typing import Dict, Any

import torch
import torch.nn as nn
from torch.optim import Adam
from torch.optim.lr_scheduler import StepLR
from tqdm import tqdm

from .dataset import build_dataloaders
from .model import RBCClassifier
from .utils import (
    ExperimentPaths,
    binary_accuracy_from_logits,
    create_summary_writer,
    get_device,
    load_yaml_config,
    parse_args,
    set_seed,
)


def train_one_epoch(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    optimizer: torch.optim.Optimizer,
    device: torch.device,
) -> Dict[str, float]:
    model.train()
    running_loss = 0.0
    running_acc = 0.0
    total = 0

    for images, targets in tqdm(loader, desc="Train", leave=False):
        images = images.to(device)
        targets = targets.float().to(device)

        optimizer.zero_grad()
        logits = model(images)
        loss = criterion(logits, targets)
        loss.backward()
        optimizer.step()

        batch_size = targets.size(0)
        acc = binary_accuracy_from_logits(logits, targets.long())

        running_loss += loss.item() * batch_size
        running_acc += acc * batch_size
        total += batch_size

    return {
        "loss": running_loss / total if total > 0 else 0.0,
        "acc": running_acc / total if total > 0 else 0.0,
    }


def evaluate(
    model: nn.Module,
    loader: torch.utils.data.DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Dict[str, float]:
    model.eval()
    running_loss = 0.0
    running_acc = 0.0
    total = 0

    with torch.no_grad():
        for images, targets in tqdm(loader, desc="Val", leave=False):
            images = images.to(device)
            targets = targets.float().to(device)

            logits = model(images)
            loss = criterion(logits, targets)

            batch_size = targets.size(0)
            acc = binary_accuracy_from_logits(logits, targets.long())

            running_loss += loss.item() * batch_size
            running_acc += acc * batch_size
            total += batch_size

    return {
        "loss": running_loss / total if total > 0 else 0.0,
        "acc": running_acc / total if total > 0 else 0.0,
    }


def main() -> None:
    args = parse_args()
    cfg: Dict[str, Any] = load_yaml_config(args.config)

    # Reproducibility and device
    seed = int(cfg.get("seed", 42))
    set_seed(seed)
    device = get_device()

    # Paths and experiment metadata
    exp_paths = ExperimentPaths(output_dir=cfg["training"]["output_dir"])

    # Data
    data_cfg = cfg["data"]
    train_loader, val_loader = build_dataloaders(
        data_root=data_cfg["root"],
        image_size=int(data_cfg.get("image_size", 224)),
        batch_size=int(cfg["training"].get("batch_size", 16)),
        num_workers=int(data_cfg.get("num_workers", 4)),
    )

    # Model
    model_cfg = cfg["model"]
    model = RBCClassifier(
        variant=model_cfg.get("variant", "b0"),
        pretrained=bool(model_cfg.get("pretrained", True)),
    ).to(device)

    # Optionally resume
    if args.checkpoint:
        state = torch.load(args.checkpoint, map_location=device)
        model.load_state_dict(state["model_state_dict"])

    # Optimization
    train_cfg = cfg["training"]
    criterion = nn.BCEWithLogitsLoss()
    optimizer = Adam(
        model.parameters(),
        lr=float(train_cfg.get("lr", 1e-4)),
        weight_decay=float(train_cfg.get("weight_decay", 0.0)),
    )
    scheduler = StepLR(
        optimizer,
        step_size=int(train_cfg.get("lr_step_size", 10)),
        gamma=float(train_cfg.get("lr_gamma", 0.1)),
    )

    # Logging
    writer = create_summary_writer(exp_paths.logs_dir)

    num_epochs = int(train_cfg.get("epochs", 20))
    best_val_acc = 0.0

    for epoch in range(1, num_epochs + 1):
        print(f"Epoch [{epoch}/{num_epochs}]")

        train_stats = train_one_epoch(
            model=model,
            loader=train_loader,
            criterion=criterion,
            optimizer=optimizer,
            device=device,
        )
        val_stats = evaluate(
            model=model,
            loader=val_loader,
            criterion=criterion,
            device=device,
        )

        print(
            f"Train: loss={train_stats['loss']:.4f}, acc={train_stats['acc']:.4f} | "
            f"Val: loss={val_stats['loss']:.4f}, acc={val_stats['acc']:.4f}"
        )

        if writer is not None:
            writer.add_scalar("train/loss", train_stats["loss"], epoch)
            writer.add_scalar("train/acc", train_stats["acc"], epoch)
            writer.add_scalar("val/loss", val_stats["loss"], epoch)
            writer.add_scalar("val/acc", val_stats["acc"], epoch)

        # Checkpointing
        val_acc = val_stats["acc"]
        if val_acc >= best_val_acc:
            best_val_acc = val_acc
            ckpt_path = f"{exp_paths.checkpoints_dir}/best.pth"
            torch.save(
                {
                    "epoch": epoch,
                    "model_state_dict": model.state_dict(),
                    "optimizer_state_dict": optimizer.state_dict(),
                    "val_acc": val_acc,
                },
                ckpt_path,
            )
            print(f"Saved new best checkpoint to {ckpt_path}")

        scheduler.step()

    if writer is not None:
        writer.close()


if __name__ == "__main__":
    main()



