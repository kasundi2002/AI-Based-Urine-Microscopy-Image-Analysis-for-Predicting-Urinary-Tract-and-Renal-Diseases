from pydantic import BaseModel
from typing import List, Optional,Dict,Any


class RBCResult(BaseModel):
    total_rbc: int
    iso_count: int
    dys_count: int
    dys_percentage: float
    hematuria_origin: str

    
class QuestionnaireAnswers(BaseModel):
    answers: Dict[int, Any]

class Question(BaseModel):
    id: int
    type: str
    question: str
    options: Optional[List[str]] = None
    condition: Optional[dict] = None


class QuestionnaireResponse(BaseModel):
    questions: List[Question]