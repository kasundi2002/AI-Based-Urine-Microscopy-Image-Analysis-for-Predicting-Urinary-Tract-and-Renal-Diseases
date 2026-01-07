# Urine Crystal Analysis Backend

This is a Python Flask backend for analyzing urine microscopy images using YOLO and EfficientNet models.

## Prerequisites

- Python 3.8+
- pip

## Installation

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Usage

1. Run the Flask application:
   ```bash
   python app.py
   ```

2. Access the API documentation (Swagger UI):
   Open your browser and navigate to:
   [http://localhost:5000/apidocs](http://localhost:5000/apidocs)

## API Endpoints

- `GET /health`: Health check
- `POST /api/analyze-image`: Upload an image for crystal detection and classification.
