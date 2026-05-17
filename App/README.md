# AeroSec Tower - Plateforme DevSecOps intelligente

A full-stack educational simulation inspired by aviation integrated tower monitoring systems such as ACAMS I-TWR.

Memoire title:

`Plateforme DevSecOps intelligente pour la supervision et la securisation des systemes de monitoring aeronautiques`

This is not a real ATC system. It is a lightweight graduation project platform for monitoring, logging, AI-style security alerts, and DevSecOps demonstration.

## Stack

- Frontend: React, Vite, TailwindCSS, Framer Motion, Axios, React Router, Recharts, Socket.io client
- Backend: Node.js, Express, PostgreSQL, JWT, bcrypt, Socket.io
- Security: Helmet, CORS, rate limiting, validation middleware, role-based routes
- Infrastructure: Docker, Docker Compose
- Pipeline context: Jenkins, SonarQube, Trivy, OWASP ZAP, k3s, GitHub Webhooks, AWS EC2

## Demo Accounts

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@aerosec.local | Admin123! |
| Operator | operator@aerosec.local | Operator123! |
| Engineer | engineer@aerosec.local | Engineer123! |

## Run With Docker

```bash
docker-compose up --build
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000/api  
PostgreSQL: localhost:5432

## Local Development

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

Create `backend/.env` from `backend/.env.example` for local runs.

## Main Features

- JWT authentication with Admin, Operator, and Engineer demo users
- Live dashboard data via Socket.io
- Aviation modules for lighting, navaids, weather, ATIS, technical monitoring, emergency systems, and datalogging
- AI security monitoring simulation with threat severity, anomaly cards, and fake security heatmap
- Searchable logs and audit events
- DevSecOps pipeline page: GitHub -> Jenkins -> SonarQube -> Trivy -> OWASP ZAP -> Docker -> k3s -> AWS
- AI deployment decision widget and deployment target tracking
- Dockerized frontend, backend, and PostgreSQL database
- DevSecOps starter artifacts: `sonar-project.properties` and GitHub webhook notes

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
/docker
/docs
```
