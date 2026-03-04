from particles.yeast.predictor import YeastPredictor


class YeastPipeline:
    def __init__(self):
        self.predictor = YeastPredictor()

    def process(self, image_np, detections):
        count = detections.get("count", 0)
        if count == 0:
            return {"detected": False, "total_count": 0, "boxes": []}
        else:
            assessment = self.predictor.decide_uti(count)
            return {
                "detected": True,
                "total_count": count,
                "boxes": detections.get("boxes", []),
                "risk_assessment": {"level": assessment}
            }
