## Methodology

This document summarises the **high-level methodology** for the project  
**"AI-Based RBC Morphology Analysis for Hematuria Cause Prediction"**.

---

### 1. Problem Definition

Microscopic haematuria can arise from **glomerular** or **nonglomerular** causes.  
Red blood cells (RBCs) observed in urine microscopy are:

- **Isomorphic** – typically associated with nonglomerular bleeding
- **Dysmorphic** – often associated with glomerular-origin bleeding

The aim is to train a deep learning model to **classify individual RBC images** as:

- Class 0: **Isomorphic**
- Class 1: **Dysmorphic**

and ultimately support **cause prediction** at the sample or patient level by aggregating cell-level predictions.

---

### 2. Data Acquisition and Preprocessing

- **Source**: Urine microscopy images collected under appropriate clinical and ethical approval (not stored in this repository).
- **Annotation**: RBCs are labelled by experts as *isomorphic* or *dysmorphic*.
- **Storage**: Images are organised in an `ImageFolder`-style directory:

```text
data_root/
├── train/
│   ├── iso/
│   └── dys/
├── val/
│   ├── iso/
│   └── dys/
└── test/
    ├── iso/
    └── dys/
```

- **Preprocessing / Augmentation**:
  - Resize to a fixed resolution determined by the model (e.g., 224–380 px).
  - Random horizontal flips, small rotations, and mild colour jitter (training only).
  - Normalisation to a fixed mean and standard deviation.

---

### 3. Model Architecture

- **Backbone**: EfficientNet family (`B0`, `B2`, `B4`) pre-trained on ImageNet.
- **Head**: Single fully connected layer mapping to **one logit** for binary classification.
- **Output**: A scalar logit, passed through a sigmoid during evaluation to obtain a probability of the *dysmorphic* class.

The architecture is implemented in `src/model.py` and is intentionally simple to:

- Focus on the utility of EfficientNet feature extraction.
- Facilitate future extensions such as:
  - Multimodal fusion (e.g., adding clinical features).
  - Sequence/patient-level models aggregating multiple RBC predictions.

---

### 4. Training Strategy

- **Loss**: Binary cross-entropy with logits (`BCEWithLogitsLoss`).
- **Optimizer**: Adam (learning rate and weight decay configured via YAML).
- **Scheduler**: StepLR with configurable step size and decay factor.
- **Batch Size / Epochs**: Defined per-config (`configs/b0.yaml`, `configs/b2.yaml`, `configs/b4.yaml`).
- **Metrics**:
  - Primary: Classification accuracy on validation and test sets.
  - Optional (to be extended): Precision, recall, F1-score, ROC-AUC.

Training is orchestrated by `src/train.py`:

- Loads configuration from `configs/*.yaml`.
- Builds `ImageFolder`-based train/validation loaders from user-provided paths.
- Logs metrics and saves the **best-performing checkpoint** based on validation accuracy.

---

### 5. Evaluation

The script `src/evaluate.py`:

- Loads a trained checkpoint.
- Evaluates performance (accuracy) on the validation or test split.
- Can be extended to:
  - Generate confusion matrices.
  - Save per-image predictions.
  - Compute patient-level statistics by aggregating cell predictions.

---

### 6. Future Extensions

Potential research extensions include:

- **Multimodal fusion**:
  - Combine RBC morphology with clinical variables (e.g., age, serum creatinine).
  - Integrate other imaging modalities or time-series data.
- **Explainability**:
  - Grad-CAM or other attribution methods to highlight discriminative RBC regions.
  - Case-level reports summarising dysmorphic/isomorphic distributions.
- **Robustness and Generalisation**:
  - Cross-centre validation.
  - Domain adaptation for different microscopes or staining protocols.

---

### 7. Reproducibility

- All hyperparameters and paths are managed via **YAML configuration files**.
- Random seeds can be controlled through the `seed` parameter in configs.
- No hard-coded absolute paths; dataset and output locations are fully configurable.

This design aims to make the repository suitable for:

- Final-year projects
- MSc/PhD theses
- Research prototypes that may evolve into larger clinical studies



