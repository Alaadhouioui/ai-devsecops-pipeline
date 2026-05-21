from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="AeroSec AI Risk Engine")

class LogEvent(BaseModel):
    message: str
    source: str = "backend"

def calculate_risk(message: str):
    message = message.lower()

    score = 10

    if "failed login" in message:
        score += 30
    if "sql injection" in message:
        score += 50
    if "port scan" in message:
        score += 40
    if "unauthorized" in message:
        score += 35
    if "error" in message:
        score += 10

    # randomness to simulate AI behavior
    score += random.randint(0, 10)

    return min(score, 100)

@app.post("/analyze")
def analyze(event: LogEvent):
    score = calculate_risk(event.message)

    if score < 30:
        level = "LOW"
    elif score < 70:
        level = "MEDIUM"
    else:
        level = "HIGH"

    return {
        "risk_score": score,
        "risk_level": level,
        "source": event.source
    }

@app.get("/")
def health():
    return {"status": "AI engine running"}
