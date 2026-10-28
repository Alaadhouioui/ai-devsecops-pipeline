# AeroSec Tower - AI-Powered DevSecOps Platform

AeroSec Tower is a full-stack educational DevSecOps platform for supervising and securing aviation-style monitoring systems. It combines a React operations dashboard, a Node.js API, PostgreSQL audit storage, Dockerized runtime services, a FastAPI AI risk engine, and a Jenkins/SonarQube/Trivy delivery pipeline.

Memoire title:

`Plateforme DevSecOps intelligente pour la supervision et la securisation des systemes de monitoring aeronautiques`

This is not a real ATC system. It is a safe graduation-project simulation for monitoring, logging, AI-assisted security analysis, and DevSecOps automation.

## What The Platform Demonstrates

- CI/CD automation with Jenkins stages for dependency installation, unit tests, SonarQube analysis and Quality Gate, Docker image builds, Trivy image scanning, OWASP ZAP baseline scanning, AI security gating, registry publishing, deployment, health checks, and K3s rollout.
- Static code analysis with SonarQube configuration for backend and frontend source code.
- Containerized services for the frontend, backend, PostgreSQL database, and AI engine.
- AI-powered security scoring for login attempts, pipeline signals, degraded services, suspicious events, and critical exposure indicators.
- DevSecOps observability through dashboards, audit logs, security alerts, simulated tower modules, and deployment status.
- Security-by-default API behavior with JWT authentication, role checks, bcrypt password hashing, Helmet, CORS, rate limiting, and request validation.

## Stack

- Frontend: React, Vite, TailwindCSS, Framer Motion, Axios, React Router, Recharts, Socket.io client
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt, Socket.io
- AI Engine: Python, FastAPI, Pydantic, xAI Grok API with deterministic fallback
- Database: PostgreSQL 16
- Security: Helmet, CORS, rate limiting, validation middleware, role-based routes, Trivy image scanning
- Infrastructure: Docker, Docker Compose, Nginx frontend proxy
- CI/CD: Jenkins, SonarQube, Trivy, AI security gate
- Pipeline context: GitHub Webhooks, Docker Build, OWASP ZAP, Nexus, Docker Hub, K3s, AWS EC2

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@aerosec.local | Admin123! |
| Operator | operator@aerosec.local | Operator123! |
| Engineer | engineer@aerosec.local | Engineer123! |

## Run With Docker

```bash
docker compose up --build
```

Frontend: http://localhost:5173  
Backend API through frontend proxy: http://localhost:5173/api  
Direct backend API: http://localhost:5000/api  
PostgreSQL: localhost:5432  
AI engine: http://localhost:8001

## Local Development

Use Node.js 20 for frontend/backend parity with the Dockerfiles.

```bash
cd backend
npm install
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

```bash
cd ai-engine
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

Create `backend/.env` from your local values when running outside Docker. At minimum, configure `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, and `AI_ENGINE_URL`.

## AI Risk Engine

The AI engine exposes `POST /analyze`. It asks an LLM (xAI Grok) for a risk assessment, enforces the thresholds below in code, and never scores below the deterministic rule baseline. If the LLM is unavailable it returns the rule-based score with `manual-review`. Example response:

```json
{
  "risk_score": 95,
  "risk_level": "CRITICAL",
  "source": "backend",
  "event_type": "auth",
  "signals": ["authentication-abuse", "critical-exposure", "failure-indicator"],
  "recommended_action": "block"
}
```

Risk levels:

| Score | Level | Recommended action |
| --- | --- | --- |
| 0-29 | LOW | approve |
| 30-69 | MEDIUM | approve |
| 70-89 | HIGH | manual-review |
| 90-100 | CRITICAL | block |

Detected signals include authentication abuse, injection attempts, reconnaissance, access-control failures, critical exposure, runtime degradation, pipeline warnings, and general failure indicators.

## DevSecOps Pipeline

The full pipeline (tests, SonarQube Quality Gate, Trivy, OWASP ZAP, AI security gate, Docker Hub / Nexus publishing, Docker Compose and K3s deployment) is documented in the [root README](../README.md#pipeline-stages) and defined in the [Jenkinsfile](../Jenkinsfile).

High AI risk marks the build unstable for manual review. Critical risk fails the pipeline.

## Main Features

- JWT authentication with Admin, Operator, and Engineer demo users
- Live dashboard data via Socket.io
- Aviation modules for lighting, navaids, weather, ATIS, technical monitoring, emergency systems, and datalogging
- AI security monitoring with threat severity, anomaly cards, risk scoring, and security heatmap
- Searchable logs and audit events
- DevSecOps pipeline page: GitHub -> Jenkins -> SonarQube -> Trivy -> OWASP ZAP -> Docker -> k3s -> AWS
- AI deployment decision widget and deployment target tracking
- Dockerized frontend, backend, PostgreSQL, and AI engine
- CI security gates for backend tests, AI tests, image scanning, and AI deployment decisions

## Verification

```bash
cd backend
npm run lint
npm test
```

```bash
python3 -m unittest discover -s ai-engine
```

```bash
cd frontend
npm run build
```

The frontend build should be run with Node.js 20. Node 18 is not sufficient for the current frontend dependency set.

## Project Structure

```text
/frontend
  /src/components
  /src/context
  /src/hooks
  /src/layouts
  /src/pages
  /src/services
/backend
  /src/controllers
  /src/middleware
  /src/models
  /src/routes
  /src/services
/ai-engine
  main.py
  test_main.py
/docker
/docs
```
