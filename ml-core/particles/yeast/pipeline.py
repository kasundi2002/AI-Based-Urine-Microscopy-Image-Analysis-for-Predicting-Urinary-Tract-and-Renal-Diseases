from particles.yeast.predictor import YeastPredictor

class YeastPipeline:
    def __init__(self):
        # Class instances initialised identically parsing inference parameters  
        self.predictor = YeastPredictor()

    def process(self, image_np, detections):
        count = detections.get("count", 0)

        if count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }

        # Route variables straight outwards 
        prediction = self.predictor.decide_risk(count)
        
        return {
            "detected": True,
            "total_count": count,
            "boxes": detections.get("boxes", []),
            "risk_assessment": {
                "level": prediction
            }
        }
