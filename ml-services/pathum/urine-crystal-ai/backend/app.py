import os
import sys
import json
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flasgger import Swagger
from werkzeug.utils import secure_filename
import cv2
import numpy as np

# Add custom library path for AI dependencies (workaround for long path issue)
sys.path.append(r"C:\tmp\urine_ai_libs")

# Ensure the python directory is in the path to import pipeline modules
sys.path.append(os.path.join(os.path.dirname(__file__), 'python'))

try:
    from pipeline import UrineCrystalPipeline
except ImportError as e:
    print(f"Error importing pipeline: {e}")
    sys.exit(1)

app = Flask(__name__)
CORS(app)

# Swagger Configuration
app.config['SWAGGER'] = {
    'title': 'Urine Crystal Analysis API',
    'uiversion': 3
}
swagger = Swagger(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Model Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
YOLO_MODEL_PATH = os.path.join(BASE_DIR, "models", "best.pt")
CLASSIFIER_MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_crystals_best_v2.keras")

# Initialize Pipeline
pipeline = None
try:
    pipeline = UrineCrystalPipeline(YOLO_MODEL_PATH, CLASSIFIER_MODEL_PATH)
    print("Pipeline initialized successfully.")
except Exception as e:
    print(f"Failed to initialize pipeline: {e}")

@app.route('/', methods=['GET'])
def index():
    return jsonify({"message": "Urine Crystal Analysis API", "swagger_ui": "/apidocs"}), 200

@app.route('/health', methods=['GET'])
@app.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    ---
    responses:
      200:
        description: System is healthy
        examples:
          application/json: { "status": "ok" }
    """
    return jsonify({"status": "ok"})

@app.route('/api/analyze-image', methods=['POST'])
def analyze_image():
    """
    Analyze Urine Microscopy Image
    ---
    parameters:
      - name: image
        in: formData
        type: file
        required: true
        description: The image file to analyze
    responses:
      200:
        description: Analysis result
        schema:
          type: object
          properties:
            status:
              type: string
            image:
              type: string
            crystals:
              type: array
              items:
                type: object
                properties:
                  bbox:
                    type: array
                    items:
                      type: integer
                  detection_confidence:
                    type: number
                  detection_class:
                    type: string
                  classification:
                    type: string
                  classification_confidence:
                    type: number
                  all_class_probabilities:
                    type: object
      400:
        description: Invalid input or missing file
      500:
        description: Server error
    """
    if 'image' not in request.files:
        return jsonify({"status": "error", "message": "No image part"}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
    
    if file and pipeline:
        try:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Run pipeline
            results = pipeline.process_image(filepath)
            
            # Clean up uploaded file if needed, or keep it for debugging
            # os.remove(filepath) 
            
            return jsonify(results)
            
        except Exception as e:
            print(f"Error processing image: {e}")
            traceback.print_exc()
            return jsonify({"status": "error", "message": str(e)}), 500
    
    return jsonify({"status": "error", "message": "Pipeline not initialized"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
