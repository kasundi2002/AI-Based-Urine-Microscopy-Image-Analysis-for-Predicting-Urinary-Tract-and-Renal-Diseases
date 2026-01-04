
import tensorflow as tf
import numpy as np
import os

# Suppress Tensorflow logs
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

MODEL_PATH = "models/efficientnet_crystals_best_v2.keras"

def inspect_model():
    if not os.path.exists(MODEL_PATH):
        print(f"Model file not found at {MODEL_PATH}")
        return

    print(f"Loading model from {MODEL_PATH}...")
    try:
        model = tf.keras.models.load_model(MODEL_PATH)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")
        return

    print("\n--- Model Layers (First 5) ---")
    for i, layer in enumerate(model.layers[:5]):
        print(f"{i}: {layer.name} ({layer.__class__.__name__})")
        if hasattr(layer, 'scale'):
             print(f"   Target scale: {layer.scale}")

    # Create a dummy image (random noise)
    dummy_img_255 = np.random.randint(0, 255, (1, 224, 224, 3)).astype(np.float32)
    dummy_img_1 = dummy_img_255 / 255.0

    print("\n--- Prediction Test (Random Noise) ---")
    
    # Test [0, 255]
    try:
        pred_255 = model.predict(dummy_img_255, verbose=0)
        print(f"Input [0-255] max conf: {np.max(pred_255):.4f}")
    except Exception as e:
        print(f"Input [0-255] failed: {e}")

    # Test [0, 1]
    try:
        pred_1 = model.predict(dummy_img_1, verbose=0)
        print(f"Input [0-1]   max conf: {np.max(pred_1):.4f}")
    except Exception as e:
        print(f"Input [0-1] failed: {e}")

if __name__ == "__main__":
    inspect_model()
