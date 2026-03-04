from particles.wbc.predictor import WBCPredictor

class WBCPipeline:
    def __init__(self):
        self.predictor = WBCPredictor()

    def process(self, image_np, detections):
        count = detections.get("count", 0)
        
        if count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }
        else:
            prediction_result = self.predictor.decide_uti(count)
            return {
                "detected": True,
                "total_count": count,
                "boxes": detections.get("boxes", []),
                "risk_assessment": {
                    "level": prediction_result
                }
            }
