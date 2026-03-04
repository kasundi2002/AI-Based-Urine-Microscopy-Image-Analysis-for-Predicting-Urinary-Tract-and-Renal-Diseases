import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from particles.cast.detector import CastDetector
from particles.cast.pipeline import CastPipeline
from particles.crystal.detector import CrystalDetector
from particles.crystal.pipeline import CrystalPipeline
from particles.wbc.detector import WBCDetector
from particles.wbc.pipeline import WBCPipeline

def get_particles():
    return [
        {
            "name": "casts",
            "detector": CastDetector(),
            "pipeline": CastPipeline()
        },
        {
            "name": "crystals",
            "detector": CrystalDetector(),
            "pipeline": CrystalPipeline()
        },
        {
            "name": "wbc",
            "detector": WBCDetector(),
            "pipeline": WBCPipeline()
        }
    ]
