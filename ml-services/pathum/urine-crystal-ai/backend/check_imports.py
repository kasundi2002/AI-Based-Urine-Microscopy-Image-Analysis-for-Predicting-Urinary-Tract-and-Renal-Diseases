
try:
    import cv2
    print("cv2: OK")
except ImportError as e:
    print(f"cv2: FAIL {e}")

try:
    import ultralytics
    print("ultralytics: OK")
except ImportError as e:
    print(f"ultralytics: FAIL {e}")

try:
    import tensorflow
    print("tensorflow: OK")
except ImportError as e:
    print(f"tensorflow: FAIL {e}")

try:
    import numpy
    print("numpy: OK")
except ImportError as e:
    print(f"numpy: FAIL {e}")
