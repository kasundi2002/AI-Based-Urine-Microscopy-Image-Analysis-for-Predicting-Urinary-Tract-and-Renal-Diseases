
import sys
print(f"Executable: {sys.executable}")
print(f"Path: {sys.path}")

try:
    import cv2
    print(f"cv2 version: {cv2.__version__}")
    print(f"cv2 file: {cv2.__file__}")
except ImportError as e:
    print(f"cv2 IMPORT FAILED: {e}")

try:
    import ultralytics
    print(f"ultralytics file: {ultralytics.__file__}")
except ImportError as e:
    print(f"ultralytics IMPORT FAILED: {e}")
