from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AeroSec AI Risk Engine")

class LogEvent(BaseModel):
    message: str
    source: str = "backend"
    type: str = "log"

def calculate_risk(message: str):
    message = message.lower()

    score = 10
    signals = []

    if "failed login" in message or "brute force" in message:
        score += 30
        signals.append("authentication-abuse")
    if "sql injection" in message or "injection" in message:
        score += 60
        signals.append("injection-attempt")
    if "port scan" in message or "scanning" in message:
        score += 40
        signals.append("reconnaissance")
    if "unauthorized" in message or "jwt verification failed" in message:
        score += 35
        signals.append("access-control")
    if "critical" in message or "secret" in message or "credential" in message:
        score += 45
        signals.append("critical-exposure")
    if "degraded_services=" in message and "none" not in message:
        score += 25
        signals.append("runtime-degradation")
    if "warnings=" in message and "none" not in message:
        score += 15
        signals.append("pipeline-warning")
    if "error" in message or "failed" in message:
        score += 10
        signals.append("failure-indicator")

    return min(score, 100), signals

@app.post("/analyze")
def analyze(event: LogEvent):
    score, signals = calculate_risk(event.message)

    if score < 30:
        level = "LOW"
    elif score < 70:
        level = "MEDIUM"
    elif score < 90:
        level = "HIGH"
    else:
        level = "CRITICAL"

    if score >= 90:
        action = "block"
    elif score >= 70:
        action = "manual-review"
    else:
        action = "approve"

    return {
        "risk_score": score,
        "risk_level": level,
        "source": event.source,
        "event_type": event.type,
        "signals": signals,
        "recommended_action": action
    }

@app.get("/")
def health():
    return {"status": "AI engine running"}
