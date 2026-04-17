from pydantic import BaseModel


class PredictionResponse(BaseModel):
    result: str
    confidence: float
    label_en: str
