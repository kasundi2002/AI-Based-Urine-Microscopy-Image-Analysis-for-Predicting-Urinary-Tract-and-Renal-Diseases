# Automated UTI Microscopy Backend

This repository contains the backend system for automated analysis of urine microscopy images for UTI screening.

## Features
- WBC detection and counting (YOLOv11)
- Yeast detection and counting (YOLOv11)
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


## Model Weights

Due to size limitations, trained model weights are not included in this repository.

Please download the following files and place them accordingly:

- WBC YOLOv11-n → `models/wbc/wbc_yolov11n.pt`
- Yeast RT-DETR-L → `models/yeast/yeast_rtdetr_l.pt`
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
