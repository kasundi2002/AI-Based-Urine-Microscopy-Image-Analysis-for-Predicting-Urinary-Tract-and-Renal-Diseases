class BacteriaPipeline:
    def process(self, image_np, detections):
        count = detections.get("count", 0)

        if count == 0:
            return {
                "detected": False,
                "total_count": 0,
                "boxes": []
            }

        return {
            "detected": True,
            "total_count": count,
            "boxes": detections.get("boxes", [])
        }
