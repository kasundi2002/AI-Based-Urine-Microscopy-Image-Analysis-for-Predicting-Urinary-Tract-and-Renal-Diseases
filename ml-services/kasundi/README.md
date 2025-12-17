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

