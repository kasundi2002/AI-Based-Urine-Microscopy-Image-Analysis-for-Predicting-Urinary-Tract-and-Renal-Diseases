
import tensorflow as tf
import numpy as np
import cv2
import os

class CrystalClassifier:
    def __init__(self, model_path):
        """
        Initialize the EfficientNetB0 classifier.

        Args:
            model_path (str): Path to the .keras model file.
        """
        self.model_path = model_path
        self.class_names = ['CaOx_Dihydrate', 'CaOx_Monohydrate', 'Phosphate', 'Uric_Acid']
        self.img_height = 224
        self.img_width = 224
        
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Classifier model not found at: {model_path}")

        # print(f"Loading Classifier model from {model_path}...")
        try:
            self.model = tf.keras.models.load_model(model_path)
            # print("Classifier model loaded successfully.")
        except Exception as e:
            raise RuntimeError(f"Failed to load classifier model: {e}")

    def preprocess(self, img_array):
        """
        Preprocess the image for EfficientNetB0.
        
        Args:
            img_array (numpy.ndarray): Input image in BGR format (from OpenCV).
            
        Returns:
            numpy.ndarray: Preprocessed image batch ready for prediction.
        """
        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img_array, cv2.COLOR_BGR2RGB)
        
        # Resize to target size
        img_resized = cv2.resize(img_rgb, (self.img_width, self.img_height))
        
        # Expand dims to create batch of 1
        img_batch = np.expand_dims(img_resized, axis=0)
        
        # Use the standard efficientnet preprocessing (which often handles 0-255 -> rescaling)
        # matching the user's Colab notebook workflow.
        img_preprocessed = tf.keras.applications.efficientnet.preprocess_input(img_batch)
        
        return img_preprocessed

    def classify(self, img_array):
        """
        Classify a single crystal image.

        Args:
            img_array (numpy.ndarray): Cropped crystal image (BGR).

        Returns:
            dict: {
                'class': str,
                'confidence': float,
                'probabilities': dict
            }
        """
        if img_array is None or img_array.size == 0:
             return {'class': 'Unknown', 'confidence': 0.0}

        preprocessed_img = self.preprocess(img_array)
        
        # Predict
        predictions = self.model.predict(preprocessed_img, verbose=0)
        score = tf.nn.softmax(predictions[0])
        
        class_idx = np.argmax(score)
        confidence = float(np.max(score))
        predicted_class = self.class_names[class_idx]
        
        return {
            'class': predicted_class,
            'confidence': confidence,
            'probabilities': {name: float(s) for name, s in zip(self.class_names, score)}
        }

if __name__ == "__main__":
    # Test block
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    MODEL_PATH = os.path.join(BASE_DIR, "models", "efficientnet_crystals_best_v2.keras")
    print(f"Classifier initialized with model: {MODEL_PATH}")
