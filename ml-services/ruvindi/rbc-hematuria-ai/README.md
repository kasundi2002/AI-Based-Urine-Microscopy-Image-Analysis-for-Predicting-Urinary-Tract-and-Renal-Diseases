## AI-Based RBC Morphology Analysis for Hematuria Cause Prediction

This repository contains a research-focused PyTorch implementation for **binary classification of red blood cell (RBC) morphology** in urine microscopy images:

- **Isomorphic RBCs** – typically associated with **nonglomerular** causes of hematuria  
- **Dysmorphic RBCs** – typically associated with **glomerular** causes of hematuria  

The goal is to support **clinical decision making** by automatically classifying individual RBCs and providing aggregated statistics that can be related to the underlying cause of hematuria.

This project is designed as a **final-year research / thesis** codebase with an emphasis on:

- **Reproducibility**
- **Clean, modular code**
- **Extensibility** (e.g., future multimodal fusion with clinical variables, other imaging modalities, or sequence-level models)

---

### Repository Structure

```text
rbc-hematuria-ai/
├── src/
│   ├── train.py          # Training entry point
│   ├── evaluate.py       # Evaluation / inference scripts
│   ├── dataset.py        # Dataset / dataloaders for RBC images
│   ├── model.py          # Model definitions (EfficientNet backbones, heads)
│   └── utils.py          # Utility functions (metrics, logging, seeding, config)
│
├── configs/
│   ├── b0.yaml           # Example config for EfficientNet-B0
│   ├── b2.yaml           # Example config for EfficientNet-B2
│   └── b4.yaml           # Example config for EfficientNet-B4
│
├── notebooks/
│   └── exploration.ipynb # Data / experiment exploration notebook
│
├── docs/
│   └── methodology.md    # Methodology and experimental setup
│
├── .gitignore
├── requirements.txt
└── README.md
```

---

### Models

This project uses **EfficientNet** backbones for RBC image classification:

- **EfficientNet-B0**
- **EfficientNet-B2**
- **EfficientNet-B4**

The backbone is followed by a **lightweight binary classification head** for predicting:

- Class `0`: **Isomorphic RBC**
- Class `1`: **Dysmorphic RBC**

Model depth, image size, and training hyperparameters are configured via **YAML config files** in `configs/`.

---

### Dataset (Important Note)

The dataset for this project consists of **urine microscopy RBC images** stored in a **private Google Drive** directory and is **not included** in this repository for:

- **Patient privacy / confidentiality**
- **Institutional and ethical constraints**
- **Storage and licensing limitations**

The code assumes an **ImageFolder-style directory layout**:

```text
data_root/
├── train/
│   ├── iso/      # Isomorphic RBC images
│   └── dys/      # Dysmorphic RBC images
├── val/
│   ├── iso/
│   └── dys/
└── test/
    ├── iso/
    └── dys/
```

You must **provide your own dataset** following this structure and **do not commit** it to the repository.

All dataset paths are provided via:

- **Config files** (`configs/*.yaml`), or
- **Command-line arguments** when running scripts

No absolute, hard-coded paths are used.

---

### Installation

1. **Clone the repository**

```bash
git clone <YOUR_REPO_URL> rbc-hematuria-ai
cd rbc-hematuria-ai
```

2. **Create and activate a virtual environment** (recommended)

```bash
python -m venv .venv
source .venv/bin/activate      # Linux / macOS
# or
.venv\Scripts\activate         # Windows
```

3. **Install dependencies**

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

---

### Basic Usage

#### 1. Configure an experiment

Edit or create a YAML config in `configs/`, for example `configs/b0.yaml`:

- Dataset root directory
- Image size / augmentations
- Model variant (B0, B2, B4)
- Batch size, learning rate, epochs, optimizer, etc.
- Output directory for logs and checkpoints

#### 2. Train a model

```bash
python -m src.train --config configs/b0.yaml
```

Key features:

- Training and validation loops
- Binary classification loss (e.g., BCEWithLogitsLoss)
- Periodic checkpoint saving (`.pth`) to a configurable output directory

#### 3. Evaluate a model

```bash
python -m src.evaluate \
  --config configs/b0.yaml \
  --checkpoint path/to/checkpoint.pth
```

Evaluation provides:

- Accuracy and loss on the validation/test set
- Confusion matrix and per-class metrics (extendable)

---

### Extensibility and Future Work

The codebase is intentionally **modular** to support:

- **New backbones** (e.g., ConvNeXt, ViT, CNN-Transformer hybrids)
- **Multimodal fusion** (e.g., combining RBC morphology with clinical features or time-series)
- **Sequence-level / patient-level models** (e.g., aggregating multiple RBC predictions)
- **Explainability modules** (e.g., Grad-CAM, feature attribution)

You can extend:

- `src/model.py` to add new architectures or fusion heads  
- `src/dataset.py` to load additional modalities or metadata  
- `src/utils.py` for new metrics, logging backends, or experiment tracking

---

### Ethical and Clinical Considerations

This project is intended **solely for research and educational purposes**.  
It is **not** a certified medical device and **must not** be used for standalone clinical decision-making.

Any deployment or use in a clinical workflow requires:

- Proper **validation and calibration** on the target population
- **Ethics approval** and appropriate regulatory processes
- Continuous collaboration with trained **medical professionals**

---

### Authors and Acknowledgements

- **Project Title**: *AI-Based RBC Morphology Analysis for Hematuria Cause Prediction*  
- **Domain**: Medical Image Analysis / Computational Pathology / Nephrology  
- **Institution**: *[Add your university / hospital / lab here]*  
- **Supervisors**: *[Supervisor Name(s)]*  
- **Student / Researcher**: *[Your Name]*  

If you use or extend this repository in your research, please consider:

- Citing the corresponding thesis / paper (when available)
- Acknowledging this codebase in your work

---

### License

Specify your license of choice here (e.g., MIT, Apache-2.0, or institutional license).


