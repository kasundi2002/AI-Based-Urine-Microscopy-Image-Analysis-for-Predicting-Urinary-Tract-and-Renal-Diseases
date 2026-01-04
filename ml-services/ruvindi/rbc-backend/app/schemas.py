from pydantic import BaseModel

class RBCResult(BaseModel):
    total_rbc: int
    iso_count: int
    dys_count: int
    dys_percentage: float
    hematuria_origin: str
