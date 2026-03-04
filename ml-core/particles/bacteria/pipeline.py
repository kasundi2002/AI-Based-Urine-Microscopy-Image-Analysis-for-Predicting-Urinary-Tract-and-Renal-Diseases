from particles.bacteria.predictor import BacteriaPredictor


class BacteriaPipeline:
    def __init__(self):
        self.predictor = BacteriaPredictor()

    def process(self, image_np, detections):
        present = detections.get("ecoli_present", False)
        level = self.predictor.assess(present)
        return {
            "ecoli_present": present,
            "risk_assessment": {"level": level}
        }
