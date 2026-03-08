import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from particles.cast.detector import CastDetector
from particles.cast.pipeline import CastPipeline
from particles.crystal.detector import CrystalDetector
from particles.crystal.pipeline import CrystalPipeline
from particles.wbc.detector import WBCDetector
from particles.wbc.pipeline import WBCPipeline
from particles.rbc.detector import RBCDetector
from particles.rbc.pipeline import RBCPipeline
from particles.yeast.detector import YeastDetector
from particles.yeast.pipeline import YeastPipeline
from particles.bacteria.detector import BacteriaDetector
from particles.bacteria.pipeline import BacteriaPipeline

def get_particles():
    # the order defines processing sequence in main app
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
        },
        {
            "name": "rbc",
            "detector": RBCDetector(),
            "pipeline": RBCPipeline()
        },
        {
            "name": "yeast",
            "detector": YeastDetector(),
            "pipeline": YeastPipeline()
        },
        {
            "name": "bacteria",
            "detector": BacteriaDetector(),
            "pipeline": BacteriaPipeline()
        }
    ]
