import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from clinical_ml.clinical_dataset1 import ClinicalDataset1Model
from clinical_ml.clinical_dataset2 import ClinicalDataset2Model
from clinical_ml.fusion import fuse_decisions, compute_confidence
from clinical_ml.uti_rules import decide_uti

class UTIMLPipeline:
    def __init__(self):
        # Load clinical models once during initialisation
        self.model_dataset1 = ClinicalDataset1Model()
        self.model_dataset2 = ClinicalDataset2Model()

    def predict(self, particle_features: dict, questionnaire_answers: dict) -> dict:
        wbc_count = particle_features.get("wbc", {}).get("total_count", 0)
        yeast_count = particle_features.get("yeast", {}).get("total_count", 0)
        bacteria_data = particle_features.get("bacteria", {})
        ecoli_present = bacteria_data.get("ecoli_count", 0) > 0

        uti_decision = decide_uti(
            wbc_count=wbc_count,
            yeast_count=yeast_count,
            ecoli_present=ecoli_present,
        )

        dataset1_probs = 0.0
        # Determine dataset1 features
        dataset1_meta = {
            k: v for k, v in {
                "age": questionnaire_answers.get("age"),
                "gender": questionnaire_answers.get("gender"),
                "dysuria": questionnaire_answers.get("dysuria"),
                "abd_pain": questionnaire_answers.get("abd_pain"),
                "fever": questionnaire_answers.get("fever"),
                "polyuria": questionnaire_answers.get("polyuria"),
            }.items() if v is not None
        }
        
        if dataset1_meta:
            dataset1_probs = self.model_dataset1.predict(dataset1_meta)

        dataset2_lower_prob, dataset2_upper_prob = 0.0, 0.0
        # Determine dataset2 features
        dataset2_meta = {
            k: v for k, v in {
                "temperature": questionnaire_answers.get("temperature"),
                "nausea": questionnaire_answers.get("nausea"),
                "lumbar_pain": questionnaire_answers.get("lumbar_pain"),
                "urine_pushing": questionnaire_answers.get("urine_pushing"),
                "micturition_pain": questionnaire_answers.get("micturition_pain"),
                "urethral_burning": questionnaire_answers.get("urethral_burning"),
            }.items() if v is not None
        }

        if dataset2_meta:
            dataset2_lower_prob, dataset2_upper_prob = self.model_dataset2.predict(dataset2_meta)

        # Image features
        wbc_severity_score = particle_features.get("severity", {}).get("normalized", 0.0)
        yeast_severity_score = particle_features.get("severity", {}).get("normalized", 0.0)

        fusion_input = {
            "image_uti": uti_decision,
            "dataset1_prob": dataset1_probs,
            "dataset2_lower_prob": dataset2_lower_prob,
            "dataset2_upper_prob": dataset2_upper_prob,
            "wbc_severity_score": wbc_severity_score,
            "yeast_severity_score": yeast_severity_score,
        }

        final_decision, uti_type = fuse_decisions(**fusion_input)
        confidence_score = compute_confidence(**fusion_input)

        return {
            "uti_rules": {"uti": uti_decision},
            "clinical_dataset1": {"probability": dataset1_probs} if dataset1_meta else {},
            "clinical_dataset2": {
                "bladder_probability": dataset2_lower_prob,
                "renal_probability": dataset2_upper_prob
            } if dataset2_meta else {},
            "fusion": {
                "final_uti": final_decision,
                "uti_type": uti_type,
                "confidence_score": confidence_score
            }
        }

# Global Pipeline Instance
uti_pipeline = UTIMLPipeline()

def run_uti_ml(particle_features: dict, questionnaire_answers: dict) -> dict:
    return uti_pipeline.predict(particle_features, questionnaire_answers)
