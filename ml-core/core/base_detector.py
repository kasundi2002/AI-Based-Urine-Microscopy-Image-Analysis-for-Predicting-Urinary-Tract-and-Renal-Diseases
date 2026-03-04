class BaseDetector:
    def detect(self, image_bytes: bytes):
        raise NotImplementedError
