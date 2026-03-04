# Automated UTI Microscopy Backend

This repository contains the backend system for automated analysis of urine microscopy images for UTI screening.

## Features
- WBC detection and counting (YOLOv11)
- Yeast detection and counting (YOLOv11)
- **Bacteria detection and counting (YOLOv9s)**
- E. coli presence classification (EfficientNet-B0)
- Rule-based UTI decision logic
- FastAPI REST interface

## Folder Structure
        ml-services/kasundi/
        ├── app/
        │ ├── api/
        │ ├── models/
        │ ├── logic/
        │ └── main.py
        ├── models/
        │ ├── wbc/
        │ ├── yeast/
        │ └── bacteria/

## System Architecture and Inference Flow

The backend is designed as a **modular, multi-stage inference pipeline** that integrates microscopy image analysis with structured clinical data to produce an interpretable UTI diagnosis.

### High-Level Architecture

The system follows a **hybrid architecture** combining:
- Deep learning–based urine microscopy analysis
- Classical machine learning models for clinical data
- Rule-based hierarchical decision fusion

Each component operates independently and is integrated only at the **decision level**, ensuring modularity, interpretability, and prevention of data leakage.

---

### Inference Pipeline Overview

At inference time, the system executes the following steps:

1. **Input Acquisition**
   - Urine microscopy image (mandatory)
   - Patient metadata (optional)
     - Symptom data (Dataset-1)
     - Clinical indicators (Dataset-2)
     - Optional segmentation toggle

2. **Microscopy-Based Analysis**
   - **WBC Detection**: Object detection model estimates white blood cell count
   - **Yeast Detection**: Object detection model estimates yeast count
   - **Bacteria Detection**: YOLO model locates and counts bacteria
   - **Bacteria Classification**: Image-level classifier predicts *E. coli* presence

3. **Image-Based UTI Decision**
   - A rule-based module evaluates microscopy findings to infer image-based UTI likelihood
   - **Decision rules** currently implemented by `decide_uti`:
     * Lower bacterial UTI: WBC + bacteria
     * Upper bacterial UTI: WBC + bacteria + WBC casts *(commented until cast detector added)*
     * Lower fungal UTI: WBC + yeast
     * Upper fungal UTI: WBC + yeast + RBC *(commented until RBC detector added)*
     * No UTI: few or no cells detected

4. **Optional Segmentation and Severity Estimation**
   - Semantic segmentation is applied to detected particles (if enabled)
   - Segmented area is normalized by image size
   - Severity is quantified as a continuous score and mapped to categorical labels  
     *(Mild / Moderate / Severe)*

5. **Clinical Data Prediction**
   - **Dataset-1**: Symptom-based model produces a weak UTI probability prior
   - **Dataset-2**: Clinical indicator model predicts probabilities for lower and upper UTI

6. **Multi-Modal Decision Fusion**
   - Image-based decision
   - Clinical probabilities
   - Severity scores
   - Hierarchical rule-based logic combines all evidence into a final diagnosis

7. **Confidence Estimation**
   - A confidence score is computed based on agreement across modalities

8. **Output Generation**
   - Final UTI decision
   - UTI type *(Lower / Upper / Uncertain)*
   - Particle counts
   - Severity indicators
   - Confidence score

---

### Design Principles

- **Modularity**: Each model is isolated and independently replaceable
- **Interpretability**: Explicit severity grading and confidence estimation
- **Scalability**: New particle detectors (e.g., RBCs, casts) can be added without refactoring
- **Clinical Alignment**: Decision logic reflects real-world diagnostic workflows

---

### Model Deployment Strategy

- All deep learning models are saved using **PyTorch `state_dict` format**
- Model architectures are explicitly reconstructed during inference
- Training checkpoints and framework-specific artifacts are excluded from deployment

This strategy ensures long-term compatibility across environments and PyTorch versions.

---

### API Integration

The system is deployed using **FastAPI** and exposes REST endpoints for inference:
- `/predict` – image-only inference
- `/predict_with_metadata` – image + clinical metadata + optional segmentation

Additional endpoints provide counts for individual particle types (WBCs, yeast, bacteria):

- `/count_wbc`
- `/count_yeast`
- `/count_bacteria`

The API returns structured JSON outputs suitable for web applications, laboratory systems, and research pipelines.


## Model Weights

Due to size limitations, trained model weights are not included in this repository.

Please download the following files and place them accordingly:

- WBC YOLOv11-n → `models/wbc/wbc_yolov11n.pt`
- Yeast RT-DETR-L → `models/yeast/yeast_rtdetr_l.pt`
- **Bacteria YOLOv9s →** `models/bacteria/best_bacteria_detect_yolov9s.pt`
- E. coli EfficientNet-B0 → `models/bacteria/ecoli_efficientnet_b0.pth`

## Model Selection and Deployment Rationale

This project employs multiple machine learning and deep learning models trained on heterogeneous datasets. Due to differences in data characteristics, model selection was performed independently for each dataset.

### Dataset-1: Symptom-Based Clinical Data
Logistic Regression and Random Forest models were evaluated using a hold-out validation strategy. Both models achieved modest performance (ROC-AUC ≈ 0.57), reflecting the limited diagnostic power of subjective symptom data. Logistic Regression was selected for deployment due to its simplicity, interpretability, and ability to provide well-calibrated probabilistic outputs. This model is used as a weak prior in the final decision framework.

### Dataset-2: Acute Inflammations Clinical Data
For Dataset-2, Logistic Regression and Random Forest models were evaluated using 5-fold cross-validation. Both models achieved near-perfect and stable performance (ROC-AUC ≈ 1.0) for bladder inflammation (Lower UTI) and renal pelvis nephritis (Upper UTI). As performance was identical, Logistic Regression was selected for deployment due to its lower complexity, greater interpretability, and suitability for clinical decision support systems.

Cross-validation models were used exclusively for model selection and performance evaluation. Final deployed models were retrained on the full dataset to maximize data utilization.

### Microscopy-Based Deep Learning Models
Deep learning models were selected based on task-specific performance and inference efficiency. YOLOv11-n was used for White Blood Cell detection, RT-DETR-L for yeast detection, and EfficientNet-B0 for E. coli classification.

### Decision-Level Fusion
All models are integrated at the decision level using a hierarchical rule-based fusion strategy. Microscopy evidence is given highest priority, followed by structured clinical indicators (Dataset-2), and finally symptom-based probabilities (Dataset-1). This design avoids data leakage, preserves dataset integrity, and reflects real-world clinical decision workflows.

## Segmentation Modules (Optional but Value-Added)

In addition to object detection, the system incorporates optional semantic segmentation models for selected urine particles.

### Implemented Segmentation Models
- **White Blood Cells (WBC)**: UNet++ with EfficientNet-B0 encoder
- **Yeast Cells**: SegFormer-B2 transformer-based segmentation model

### Purpose of Segmentation
Segmentation enables quantification of particle burden and spatial extent, allowing severity assessment rather than binary presence detection.

### Severity Metrics
- Total segmented area
- Area-normalized severity index
- Rule-based severity grading (Mild / Moderate / Severe)

### Design Decision
Segmentation modules are optional and executed conditionally to reduce computational overhead while providing enhanced clinical interpretability when required.
