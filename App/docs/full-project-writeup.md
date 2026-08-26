# AeroSec Tower Full Project Write-Up

## 1. Project Overview

AeroSec Tower is a full-stack AI-powered DevSecOps simulation platform created around an aviation-style monitoring environment. The project is designed as an educational and academic demonstration, not as a real air traffic control or airport operations system. Its value is in showing how modern secure software delivery, operational monitoring, audit logging, artificial intelligence risk analysis, and containerized infrastructure can be combined into one understandable system.

The project theme is:

`Plateforme DevSecOps intelligente pour la supervision et la securisation des systemes de monitoring aeronautiques`

The platform presents itself as an integrated tower monitoring console. It gives users a realistic dashboard for aviation subsystems, cybersecurity alerts, operational logs, simulated telemetry, deployment tracking, and DevSecOps pipeline visibility. Behind that interface, the system includes a React frontend, a Node.js backend, a PostgreSQL database, a FastAPI AI risk engine, Dockerized services, Jenkins automation, SonarQube analysis, and Trivy container scanning.

The project is built to demonstrate the complete lifecycle of a secure application: development, testing, static analysis, image building, vulnerability scanning, AI-assisted security gating, deployment, and runtime health checks.

## 2. Main Objective

The main objective of AeroSec Tower is to simulate an intelligent DevSecOps platform for supervising and securing aviation monitoring systems. It shows how operational data and security data can be observed together, how access can be controlled, how logs can be audited, how an AI service can support risk decisions, and how a CI/CD pipeline can enforce quality and security gates before deployment.

The platform focuses on these core ideas:

- Secure user authentication using JWT and bcrypt.
- Role-based access control for sensitive actions.
- Centralized audit and log visibility.
- AI-assisted risk scoring for authentication, security, runtime, and pipeline events.
- Live simulated telemetry through Socket.io.
- Dockerized service deployment.
- CI/CD automation through Jenkins.
- Static code analysis through SonarQube.
- Container vulnerability scanning through Trivy.
- Demonstration of future deployment targets such as k3s and AWS EC2.

## 3. Repository Structure

The repository is organized into application, pipeline, Jenkins, and SonarQube areas.

```text
.
├── App
│   ├── README.md
│   ├── docker-compose.yml
│   ├── sonar-project.properties
│   ├── ai-engine
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   ├── requirements.txt
│   │   └── test_main.py
│   ├── backend
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── middleware
│   │   │   ├── models
│   │   │   ├── routes
│   │   │   ├── services
│   │   │   └── server.js
│   │   └── test
│   ├── docker
│   │   └── init.sql
│   ├── docs
│   │   ├── architecture.md
│   │   ├── github-webhook.md
│   │   └── full-project-writeup.md
│   └── frontend
│       ├── Dockerfile
│       ├── index.html
│       ├── nginx.conf
│       ├── package.json
│       ├── src
│       │   ├── components
│       │   ├── context
│       │   ├── hooks
│       │   ├── layouts
│       │   ├── pages
│       │   ├── services
│       │   ├── App.jsx
│       │   ├── main.jsx
│       │   └── styles.css
│       ├── tailwind.config.js
│       └── vite.config.js
├── Jenkinsfile
├── jenkins
│   └── docker-compose.yml
└── sonarqube
    └── docker-compose.yml
```

The `App` directory is the main product. The root-level `Jenkinsfile` defines the CI/CD pipeline. The `jenkins` and `sonarqube` directories contain supporting infrastructure for running Jenkins and SonarQube locally or on a demo VM.

## 4. High-Level Architecture

AeroSec Tower uses a multi-service architecture:

- The React frontend renders the web console.
- Nginx serves the production frontend and proxies API/WebSocket traffic.
- The Express backend exposes REST endpoints, handles authentication, queries PostgreSQL, emits live events, and calls the AI engine.
- PostgreSQL stores persistent demo and audit data.
- The FastAPI AI engine evaluates text events and returns risk decisions.
- Docker Compose runs the main application stack.
- Jenkins orchestrates CI/CD.
- SonarQube analyzes backend and frontend source code.
- Trivy scans built container images.

The data flow begins with the user logging into the frontend. The frontend sends credentials to the backend. The backend validates the user, consults the AI engine, stores audit and AI events, then returns a JWT. After authentication, the frontend uses that JWT on API requests. The backend returns dashboard, logs, alerts, monitoring, and DevSecOps data. At the same time, Socket.io delivers simulated live telemetry.

## 5. Docker Runtime Architecture

The main Docker runtime is defined in `App/docker-compose.yml`.

### 5.1 PostgreSQL Container

The PostgreSQL service uses `postgres:16-alpine` and runs as the main application database.

Important details:

- Container name: `aerosec-postgres`
- Host port: `5432`
- Database: `aerosec_tower`
- User: `aerosec`
- Password: `aerosec_password`
- Initialization file: `./docker/init.sql`
- Healthcheck: `pg_isready -U aerosec -d aerosec_tower`
- Network: `devsecops-net`

The database stores users, logs, alerts, system status records, audit events, AI events, and deployments.

### 5.2 Backend Container

The backend service is built from `App/backend/Dockerfile`.

Important details:

- Container name: `aerosec-backend`
- Runtime: Node.js 20 Alpine
- Internal port: `5000`
- Host port: `5000`
- Start command: `npm start`
- Database URL: `postgres://aerosec:aerosec_password@postgres:5432/aerosec_tower`
- AI engine URL: `http://ai-engine:8000`
- CORS origin: `http://localhost:5173`
- Depends on healthy PostgreSQL

The backend is the main API and orchestration layer. It owns authentication, authorization, database reads/writes, live telemetry emission, and communication with the AI engine.

### 5.3 Frontend Container

The frontend service is built from `App/frontend/Dockerfile`.

Important details:

- Container name: `aerosec-frontend`
- Build runtime: Node.js 20 Alpine
- Production runtime: Nginx 1.27 Alpine
- Host port: `5173`
- Internal Nginx port: `80`
- API URL build argument: `/api`
- Socket URL build argument: empty string, meaning same-origin Socket.io connection

The frontend Dockerfile is a multi-stage build. The first stage installs dependencies and builds the Vite application. The second stage copies the static build output into Nginx.

### 5.4 AI Engine Container

The AI engine service is built from `App/ai-engine/Dockerfile`.

Important details:

- Container name: `ai-engine`
- Runtime: Python 3.11 slim
- Internal port: `8000`
- Host port: `8001`
- Start command: `uvicorn main:app --host 0.0.0.0 --port 8000`

The AI engine exposes a health endpoint and an analysis endpoint. It is used by the backend during login and DevSecOps deployment decision-making.

### 5.5 Nginx Proxy

The frontend Nginx configuration is in `App/frontend/nginx.conf`.

It handles three responsibilities:

- Serves static frontend files from `/usr/share/nginx/html`.
- Proxies `/api/` requests to `http://backend:5000/api/`.
- Proxies `/socket.io/` WebSocket traffic to `http://backend:5000/socket.io/`.
- Falls back all other paths to `/index.html` for frontend navigation.

This makes the frontend container the main browser entrypoint while still allowing backend and WebSocket traffic to work behind the same origin.

## 6. Current Running Containers

The project currently has the main application and supporting DevSecOps services running.

Observed running containers:

- `aerosec-frontend`: frontend web application, exposed on port `5173`.
- `aerosec-backend`: backend API, exposed on port `5000`.
- `ai-engine`: FastAPI AI service, exposed on port `8001`.
- `aerosec-postgres`: PostgreSQL 16 app database, exposed on port `5432`, healthy.
- `jenkins`: Jenkins LTS, exposed on ports `8080` and `50000`.
- `sonarqube`: SonarQube LTS Community, exposed on port `9000`.
- `sonar-db`: PostgreSQL 15 database for SonarQube.

Observed local images include the app images and multiple Jenkins build-tagged images:

- `app-backend:latest`
- `app-frontend:latest`
- `app-ai-engine:latest`
- `aerosec-backend:35`, `36`, `39`, `43`, `44`
- `aerosec-frontend:35`, `36`, `39`, `43`, `44`
- `aerosec-ai-engine:35`, `36`, `39`, `43`, `44`
- `aquasec/trivy:latest`
- `ghcr.io/aquasecurity/trivy-db:2`
- `jenkins/jenkins:lts`
- `sonarqube:lts-community`
- `postgres:15`
- `postgres:16-alpine`
- `node:20-alpine`
- `python:3.11-slim`
- `nginx:1.27-alpine`

This confirms that the repository is not only source code; it has an active containerized runtime and a working DevSecOps toolchain around it.

## 7. Backend Architecture

The backend is a Node.js application using Express. It is located in `App/backend`.

The backend dependencies include:

- `express` for the API server.
- `pg` for PostgreSQL access.
- `jsonwebtoken` for JWT session tokens.
- `bcryptjs` for password verification.
- `helmet` for HTTP security headers.
- `cors` for controlled browser access.
- `express-rate-limit` for request throttling.
- `socket.io` for live telemetry.
- `axios` for calling the AI engine and health endpoints.
- `dotenv` for environment variables.

### 7.1 Backend Entry Point

The entry point is `App/backend/src/server.js`.

It performs these actions:

- Loads environment variables.
- Creates an Express app.
- Creates an HTTP server.
- Creates a Socket.io server.
- Configures CORS.
- Enables Helmet.
- Sets Express trusted proxy behavior.
- Enables JSON request parsing.
- Enables rate limiting.
- Registers health endpoint `/health`.
- Mounts all API route groups.
- Registers global error handling.
- Sends initial Socket.io events on client connection.
- Broadcasts fresh simulated telemetry every 4.5 seconds.
- Calls `seedDemoData()` before starting the HTTP listener.

### 7.2 Backend Routes

The backend exposes these route groups:

`/api/auth`

- `POST /login`: validates credentials, calls the AI engine, returns a JWT on success.
- `GET /me`: returns the authenticated user from the JWT.

`/api/dashboard`

- `GET /`: returns dashboard snapshot, recent alerts, recent logs, and system status.

`/api/modules`

- `GET /`: returns all simulated monitoring modules.
- `GET /:slug`: returns one module by slug.

`/api/logs`

- `GET /`: returns combined operational logs and audit events.

`/api/security`

- `GET /alerts`: returns alerts, heatmap, and posture data.
- `POST /simulate`: creates a simulated attack alert. This requires `Admin` or `Engineer`.

`/api/devsecops`

- `GET /`: returns pipeline state, deployments, runtime service health, and AI deployment decision.

### 7.3 Backend Middleware

`validateLogin(req, res, next)` validates login payloads. It requires both `email` and `password` to exist and to be strings. If validation fails, it returns HTTP 400.

`requireAuth(req, res, next)` checks the `Authorization` header for a Bearer token. If no token exists, it returns HTTP 401. If the token is invalid or expired, it also returns HTTP 401. If valid, it attaches the decoded user to `req.user`.

`requireRole(...roles)` checks whether the authenticated user's role is allowed. If not, it returns HTTP 403.

### 7.4 Authentication Flow

The authentication controller is in `App/backend/src/controllers/authController.js`.

The `login` function follows this flow:

1. Reads email and password from the request body.
2. Lowercases the email.
3. Looks up the user in PostgreSQL.
4. Compares the password with the stored bcrypt hash.
5. If login fails, inserts a warning log.
6. Sends the failed login event to the AI engine.
7. Stores the AI result in `ai_events`.
8. Blocks the request if risk score is high enough.
9. If login succeeds, sends a successful-login event to the AI engine.
10. Blocks the login if the AI result is high risk.
11. Signs an 8-hour JWT with user ID, email, role, and name.
12. Writes an audit event.
13. Stores the successful AI event.
14. Returns token, user object, and risk result.

The `me` function returns the decoded JWT user.

### 7.5 Dashboard Controller

The dashboard controller fetches:

- Latest five alerts.
- Latest eight logs.
- All system status rows ordered by module and component.
- A fresh simulated dashboard snapshot.

It returns a combined dashboard payload for the frontend.

### 7.6 Modules Controller

The modules controller exposes the simulated aviation monitoring modules. It can list all modules or return a single module by slug. If a slug does not exist, it returns HTTP 404.

### 7.7 Logs Controller

The logs controller merges two data sources:

- Operational logs from `logs`.
- Audit actions from `audit_events`.

It uses SQL `ILIKE` matching so the search can find text inside source, level, message, user email, or action. It returns up to 100 newest records.

### 7.8 Security Controller

The security controller returns active alerts and derived security intelligence.

`listAlerts` returns:

- Recent alerts.
- Threat surface heatmap.
- Security posture object.

`createAttackSimulation` inserts a simulated alert with title, severity, category, and description. This route is protected by role-based authorization.

### 7.9 DevSecOps Controller

The DevSecOps controller is one of the most important parts of the backend because it connects application runtime health with pipeline risk.

`getDevSecOps` returns:

- Simulated pipeline stages.
- Recent deployment records.
- Runtime container/service health.
- AI deployment decision.

Runtime checks include:

- Frontend HTTP check against `http://frontend/`.
- Backend HTTP check against `http://backend:5000/health`.
- PostgreSQL query check using `SELECT 1`.
- AI engine HTTP check against configured `AI_ENGINE_URL`.

Each service receives:

- Name.
- Status: `healthy` or `degraded`.
- Latency in milliseconds.
- Display CPU value.
- Display memory value.
- Error detail if degraded.

The AI deployment decision combines:

- Pipeline warnings.
- Degraded runtime services.
- Latest deployment risk score.
- AI engine score.

The final decision can be:

- `approve`
- `manual-review`
- `block`

## 8. Backend Simulation Service

The simulation service is in `App/backend/src/services/simulationService.js`.

It creates realistic demonstration data without depending on real airport infrastructure.

Main functions:

`buildDashboardSnapshot()` creates a live operational state including runway, lighting, weather, navaids, emergency state, uptime, threat score, active flights, deployment health, telemetry series, and timestamp.

`buildActivityEvent()` creates a random event with type, message, severity, and timestamp.

`getModules()` returns seven aviation-style modules:

- Airfield Lighting Control
- Navaids Monitoring
- Weather Information
- ATIS Information
- Technical Monitoring
- Emergency Systems
- Datalogging

`getPipeline()` returns the DevSecOps delivery chain:

- GitHub
- Jenkins
- SonarQube
- Trivy
- OWASP ZAP
- Docker Build
- Kubernetes
- AWS Deployment

`getSecurityHeatmap()` returns simulated risk percentages for:

- Auth API
- Logs API
- Dashboard API
- Socket Gateway
- Postgres

`getSecurityPosture(alerts)` calculates a risk posture from alert severities. It returns:

- Posture score.
- Risk level.
- Active incidents.
- Blocked request estimate.
- Failed login estimate.
- Mean time to contain.
- MITRE ATT&CK mappings.
- Security controls.
- Incident response playbook.

Internal helper functions include:

- `module()`
- `step()`
- `pick()`
- `randomMetric()`
- `componentLabel()`
- `cryptoId()`
- `tactic()`
- `control()`
- `stepItem()`

## 9. Database Architecture

The database is initialized by `App/docker/init.sql`.

### 9.1 Tables

`users` stores platform accounts. It includes a UUID primary key, name, email, password hash, role, and creation timestamp. The role field is constrained to `Admin`, `Operator`, or `Engineer`.

`logs` stores system and operational log records.

`alerts` stores cybersecurity and operational alerts with severity, category, description, status, and timestamp.

`system_status` stores subsystem component status and metric values.

`audit_events` stores user actions and important system events.

`ai_events` stores AI risk scoring results connected to user authentication or security events.

`deployments` stores deployment environment, version, status, risk score, decision, target, and timestamp.

### 9.2 Seeded Demo Users

The project seeds three demo users:

- `admin@aerosec.local` with password `Admin123!` and role `Admin`.
- `operator@aerosec.local` with password `Operator123!` and role `Operator`.
- `engineer@aerosec.local` with password `Engineer123!` and role `Engineer`.

### 9.3 Seeded Logs

Seeded logs include runway synchronization, suspicious login velocity, navaids status, weather model update, and Docker backend health.

### 9.4 Seeded Alerts

Seeded alerts include:

- SQL injection attempt.
- Port scanning.
- Unauthorized API request.
- Runway lighting controller latency.

### 9.5 Seeded System Status

Seeded system status rows cover lighting, taxiway, ILS, DME, weather, ATIS, UPS, and emergency systems.

### 9.6 Seeded Deployments

Seeded deployments include:

- `local-docker`: healthy, approved, Docker Compose target.
- `k3s-staging`: running, manual review, single-node k3s target.
- `aws-ec2-demo`: standby, approved, AWS EC2 target.

## 10. AI Engine

The AI engine is located in `App/ai-engine`.

It is a FastAPI application with a deterministic risk scoring model. This is important for academic demonstration because reviewers can understand and reproduce each decision.

### 10.1 API Endpoints

`GET /`

Returns:

```json
{
  "status": "AI engine running"
}
```

`POST /analyze`

Accepts:

```json
{
  "message": "event text",
  "source": "backend",
  "type": "log"
}
```

Returns:

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

### 10.2 Risk Scoring Function

The core function is `calculate_risk(message)`.

It starts with a base score of 10 and then adds points based on detected text patterns.

Scoring rules:

- Failed login or brute force: +30.
- SQL injection or injection: +60.
- Port scan or scanning: +40.
- Unauthorized or JWT verification failed: +35.
- Critical, secret, or credential: +45.
- Degraded services: +25.
- Pipeline warnings: +15.
- Error or failed: +10.

The score is capped at 100.

### 10.3 Risk Levels

- 0 to 29: `LOW`
- 30 to 69: `MEDIUM`
- 70 to 89: `HIGH`
- 90 to 100: `CRITICAL`

### 10.4 Recommended Actions

- `approve` for scores below 70.
- `manual-review` for scores from 70 to 89.
- `block` for scores 90 and above.

### 10.5 AI Tests

`App/ai-engine/test_main.py` tests:

- Low-risk routine telemetry.
- SQL injection detection.
- Critical combined failed-login and credential-exposure detection.

The tests stub FastAPI and Pydantic so the risk scoring function can be tested without requiring those packages to be installed in the test environment.

## 11. Frontend Architecture

The frontend is located in `App/frontend`.

It is a React application built with Vite and styled with TailwindCSS. It uses Recharts for charts, Socket.io client for live telemetry, Framer Motion for animation, Axios for API calls, and Lucide icons for UI symbolism.

### 11.1 Frontend Entry

`src/main.jsx` mounts the React application into `#root`. It wraps the application in:

- `NavigationProvider`
- `AuthProvider`

This means authentication and navigation state are available throughout the app.

### 11.2 Custom Navigation

The frontend does not use React Router. It implements its own navigation context in `src/context/NavigationContext.jsx`.

The navigation provider:

- Reads `window.location.pathname`.
- Normalizes paths.
- Listens to `popstate`.
- Provides `navigate(to, { replace })`.
- Updates browser history with `pushState` or `replaceState`.

The route map in `App.jsx` includes:

- `/`: Dashboard
- `/modules`: Monitoring modules
- `/security`: AI security
- `/logs`: Logs console
- `/devsecops`: DevSecOps page
- `/login`: Login page

Unknown protected paths redirect to `/`.

### 11.3 Authentication Context

The auth context stores:

- JWT token.
- User object.
- Authentication status.

It persists the token and user in `localStorage` using:

- `aerosec_token`
- `aerosec_user`

Functions:

- `loginSession(authToken, authUser)`
- `logoutSession()`
- `useAuth()`

### 11.4 API Service

`src/services/api.js` creates an Axios instance.

The base URL is:

- `VITE_API_URL` if provided.
- `/api` by default.

A request interceptor automatically attaches:

`Authorization: Bearer <token>`

when a token exists in `localStorage`.

### 11.5 Socket Hook

`src/hooks/useSocket.js` connects to Socket.io.

It listens for:

- `tower:snapshot`
- `tower:event`

It returns:

- `snapshot`
- `events`

It keeps only the latest eight events and disconnects when the component unmounts.

## 12. Frontend Pages

### 12.1 Login Page

The login page provides a secure JWT login form and quick-select demo accounts.

Demo accounts:

- Admin
- Operator
- Engineer

The form posts to `/auth/login`. On success, it stores the JWT and user in localStorage and redirects to the dashboard. On failure, it displays a simple error message.

### 12.2 Dashboard Page

The dashboard page is the main operations center.

It displays:

- Active runway.
- Airfield lighting percentage.
- Weather wind and visibility.
- AI threat score.
- Realtime telemetry chart.
- Radar simulation.
- System health.
- Video surveillance simulation.
- Airport activity feed.
- AI security alerts.
- Emergency systems state.
- Navaids state.
- System uptime.

It combines initial API data from `/dashboard` with live Socket.io snapshots.

### 12.3 Monitoring Modules Page

The modules page displays aviation subsystem monitoring.

Modules include:

- Airfield Lighting Control
- Navaids Monitoring
- Weather Information
- ATIS Information
- Technical Monitoring
- Emergency Systems
- Datalogging

Each module shows:

- Overall health.
- Status pill.
- Metric bars.
- Component-level status.
- Component signal quality.
- Recent simulated events.

### 12.4 AI Security Page

The security page acts as a cybersecurity operations center.

It displays:

- Current posture score.
- Risk level.
- Active incidents.
- Blocked requests.
- Failed login indicators.
- Mean time to contain.
- Threat surface heatmap.
- MITRE ATT&CK mapping.
- Attack simulation lab.
- Incident response playbook.
- Security control coverage.
- Security logs and alerts.

Attack simulation buttons create new alerts through `/security/simulate`. This action requires the user role to be `Admin` or `Engineer`.

### 12.5 Logs Page

The logs page displays audit and datalogging records.

It fetches `/logs` and provides a client-side search box. Records show:

- Source.
- Level.
- Message.
- Type.

The backend combines operational logs and audit events before sending them to the frontend.

### 12.6 DevSecOps Page

The DevSecOps page visualizes the secure delivery pipeline.

It displays:

- Pipeline stages.
- Quality and security scores.
- AI deployment decision.
- Container health.
- Deployment targets.

The pipeline stages are:

- GitHub
- Jenkins
- SonarQube
- Trivy
- OWASP ZAP
- Docker Build
- Kubernetes
- AWS Deployment

The page fetches `/devsecops` and renders both simulated pipeline state and real runtime health checks from the backend.

## 13. Frontend Components

`AppLayout` creates the main shell with sidebar navigation, brand block, user profile, role display, logout button, and main content area.

`MetricCard` renders animated metric tiles with labels, values, details, and optional icons.

`StatusPill` converts statuses into colored badges. It supports statuses such as `online`, `success`, `approve`, `healthy`, `running`, `standby`, `manual-review`, `warning`, `medium`, `high`, `degraded`, `maintenance`, `critical`, `offline`, and `simulated`.

`TelemetryChart` renders an area chart for runway, cyber, and infrastructure telemetry.

`RadarPanel` renders a CSS radar simulation with a rotating sweep.

`ChartBars` renders simple vertical bar charts for module and system metrics.

## 14. Styling And User Experience

The frontend uses a dark operations-console visual style. The design language is based on:

- Dark blue and near-black backgrounds.
- Cyan operational highlights.
- Red/pink alert accents.
- Glass-style panels.
- Subtle grid backgrounds.
- Glow shadows.
- Animated radar sweep.
- Compact dashboard cards.
- Operational typography.

The style supports the aviation monitoring theme by making the application feel like a control-room dashboard rather than a marketing website.

## 15. Jenkins CI/CD Pipeline

The Jenkins pipeline is defined in the root `Jenkinsfile`. It is a declarative pipeline and represents the secure software delivery flow of the project.

### 15.1 Pipeline Options

The pipeline uses:

- `timestamps()` for timestamped logs.
- `disableConcurrentBuilds()` to prevent overlapping builds.
- `buildDiscarder(logRotator(...))` to keep the last 20 builds and artifacts.
- A global timeout of 45 minutes.

### 15.2 Pipeline Environment

The Jenkinsfile defines:

- `SONAR_HOST`: SonarQube server URL.
- `AI_ENGINE`: AI engine URL.
- `BACKEND_HEALTH_URL`: backend health endpoint.
- `AI_HEALTH_URL`: AI engine health endpoint.
- `IMAGE_TAG`: Jenkins build number.
- `NODE_OPTIONS`: Node memory option.

Current configured URLs point to `192.168.56.128`, which appears to be a VM or demo host address. These values must match the actual environment where Jenkins runs.

### 15.3 Checkout Stage

The checkout stage:

- Cleans the Jenkins workspace.
- Checks out source code from SCM.

This ensures every pipeline run starts from a clean source state.

### 15.4 Project Info Stage

This stage prints:

- Current workspace path.
- Listing of the `App` directory.

It is useful for debugging Jenkins workspace layout.

### 15.5 Install Dependencies Stage

This stage runs in parallel:

- Backend: `npm ci` inside `App/backend`.
- Frontend: `npm ci` inside `App/frontend`.

Using `npm ci` makes dependency installation reproducible from package lock files.

### 15.6 Tests Stage

This stage runs in parallel:

- Backend tests: `npm test`.
- AI tests: `python3 -m unittest discover -s App/ai-engine`.

Backend tests cover authentication middleware, role middleware, and login validation. AI tests cover deterministic risk scoring behavior.

### 15.7 SonarQube Analysis Stage

The SonarQube stage:

- Uses the Jenkins tool named `sonar-scanner`.
- Uses Jenkins SonarQube environment named `sonarqube`.
- Scans `App/backend/src` and `App/frontend/src`.
- Excludes `node_modules`, `dist`, and `build`.
- Sets JavaScript max memory.
- Waits for quality gate analysis.

This provides static code quality and maintainability analysis.

### 15.8 Quality Gate Stage

The quality gate stage waits up to five minutes for the SonarQube quality gate. If the gate fails, Jenkins aborts the pipeline.

This is a DevSecOps control because it prevents promotion of code that fails configured quality rules.

### 15.9 Docker Image Build Stage

This stage builds three images:

- `aerosec-backend:${IMAGE_TAG}`
- `aerosec-frontend:${IMAGE_TAG}`
- `aerosec-ai-engine:${IMAGE_TAG}`

The build number is used as the image tag, giving traceability between Jenkins builds and Docker artifacts.

### 15.10 Trivy Scan Stage

The Trivy stage scans every built image.

It scans:

- Backend image.
- Frontend image.
- AI engine image.

The command uses:

- Docker socket mount.
- Trivy cache mount.
- Vulnerability scanner.
- No progress output.
- Exit code `1` on blocked findings.
- Severity threshold `HIGH,CRITICAL`.

If Trivy finds high or critical vulnerabilities, the pipeline fails.

### 15.11 AI Security Gate Stage

This stage calls the AI engine directly:

```json
{
  "message": "pipeline security analysis",
  "type": "devsecops"
}
```

The response is saved as `ai-report.json` and archived as a Jenkins artifact.

The stage parses the JSON response:

- If `risk_score >= 90` or `risk_level == CRITICAL`, the pipeline fails.
- If `risk_score >= 70` or `risk_level == HIGH`, the build is marked unstable.

This is the project’s AI-assisted deployment governance step.

### 15.12 Deploy Stage

The deploy stage runs:

```bash
docker compose down || true
docker compose up -d --build
```

It tears down the existing compose stack if present, then starts the stack again in detached mode with rebuild enabled.

### 15.13 Health Check Stage

The health check stage retries three times and checks:

- Backend health URL.
- AI engine health URL.

It uses `curl -f`, so non-success HTTP responses fail the check.

### 15.14 Post Actions

After the pipeline:

- Success prints `SUCCESS: Pipeline completed`.
- Failure prints `FAILED: Pipeline failed`.
- Always runs `cleanWs()`.

## 16. Jenkins Runtime Container

The Jenkins container is defined in `jenkins/docker-compose.yml`.

Important details:

- Image: `jenkins/jenkins:lts`
- Container name: `jenkins`
- Ports: `8080` and `50000`
- Runs as root
- Mounts `jenkins_home`
- Mounts `/var/run/docker.sock`
- Mounts `/usr/bin/docker`
- Uses external network `devsecops-net`

Mounting the Docker socket allows Jenkins to build images, run Trivy containers, and deploy the Docker Compose stack through the host Docker daemon.

## 17. SonarQube Runtime

The SonarQube stack is defined in `sonarqube/docker-compose.yml`.

It includes:

- `sonarqube:lts-community`
- `postgres:15` as `sonar-db`

SonarQube is exposed on port `9000`.

The Sonar database uses:

- Database: `sonar`
- User: `sonar`
- Password: `sonarpass`

The compose file also sets JVM memory options to keep the service practical for a small demo machine.

## 18. Sonar Project Configuration

The app-level Sonar configuration is in `App/sonar-project.properties`.

It defines:

- Project key: `aerosec-tower`
- Project name: `AeroSec Tower`
- Sources: `backend/src,frontend/src`
- Exclusions: `node_modules` and `dist`
- LCOV report path: `coverage/lcov.info`

The Jenkinsfile also passes Sonar properties directly during pipeline execution, including a Jenkins-specific project key `jenkins-aerosec`.

## 19. Security Model

AeroSec Tower includes application security and pipeline security.

Application security:

- Passwords are stored as bcrypt hashes.
- JWT protects private API routes.
- Role checks protect sensitive actions.
- Login requests are validated.
- Helmet adds HTTP hardening headers.
- CORS restricts browser origins.
- Rate limiting reduces abusive request volume.
- Audit events record successful logins.
- Failed logins are logged.
- Login attempts are analyzed by the AI engine.
- High-risk login attempts can be blocked.

Pipeline security:

- Backend tests run before deployment.
- AI engine tests run before deployment.
- SonarQube quality gate can abort the build.
- Docker images are scanned with Trivy.
- High and critical CVEs fail the build.
- AI risk scoring can mark the build unstable or block it.
- Health checks verify runtime services after deployment.

## 20. What Is Real And What Is Simulated

Real implemented features:

- React frontend.
- Express backend.
- PostgreSQL database.
- FastAPI AI engine.
- JWT login.
- bcrypt password checking.
- Role-based protected route.
- Database seeding.
- Audit event storage.
- Security alert storage.
- AI event storage.
- Socket.io live event delivery.
- Docker Compose runtime.
- Nginx API and WebSocket proxy.
- Jenkins pipeline file.
- SonarQube container configuration.
- Trivy scan commands.
- Backend and AI unit tests.
- Runtime health checks.

Simulated features:

- Aviation telemetry.
- Radar display.
- Airport subsystem health.
- Security heatmap values.
- MITRE posture data.
- Incident response playbook values.
- Pipeline stage status shown in the UI.
- k3s staging deployment state.
- AWS EC2 promotion state.
- OWASP ZAP stage in the visual pipeline.

Future or planned integration areas:

- Real OWASP ZAP scanning.
- Real k3s deployment manifests.
- Real AWS EC2 deployment automation.
- Real external telemetry sources.
- Real alert correlation engine.
- More advanced AI or machine-learning model.

## 21. Demo Accounts

The platform includes three demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@aerosec.local | Admin123! |
| Operator | operator@aerosec.local | Operator123! |
| Engineer | engineer@aerosec.local | Engineer123! |

The Admin and Engineer roles can trigger attack simulations. Operator can use the normal monitoring views but is blocked from privileged simulation actions.

## 22. Local Access Points

When running through Docker Compose:

- Frontend: `http://localhost:5173`
- Backend API through frontend proxy: `http://localhost:5173/api`
- Direct backend API: `http://localhost:5000/api`
- Backend health: `http://localhost:5000/health`
- PostgreSQL: `localhost:5432`
- AI engine: `http://localhost:8001`
- Jenkins: `http://localhost:8080`
- SonarQube: `http://localhost:9000`

## 23. Verification Commands

Backend:

```bash
cd App/backend
npm test
```

AI engine:

```bash
python3 -m unittest discover -s App/ai-engine
```

Frontend:

```bash
cd App/frontend
npm run build
```

Docker:

```bash
cd App
docker compose up --build
```

## 24. Professional Assessment

AeroSec Tower is a strong educational DevSecOps demonstration because it connects many important engineering concerns in one coherent project. The application is not just a dashboard mockup; it includes a working backend, persistent database, authentication, authorization, live telemetry, AI scoring, Docker deployment, CI/CD pipeline logic, code quality scanning, vulnerability scanning, and health validation.

The strongest technical quality of the project is the integration story. The frontend demonstrates operational and cybersecurity visibility. The backend ties together data, security, and AI. The AI engine provides explainable risk decisions. Docker gives the system reproducible runtime infrastructure. Jenkins turns the project into a complete DevSecOps pipeline.

The main limitation is that several advanced deployment and security stages are still modeled rather than fully operational. OWASP ZAP, k3s, and AWS EC2 are represented in documentation and UI, but the repository does not yet contain complete working automation for them. That is acceptable for a graduation simulation, but it should be clearly explained during presentation.

Overall, the project is a complete and credible DevSecOps lab platform. It demonstrates secure development practices, operational monitoring, AI-assisted decision-making, and automated delivery controls in a way that is understandable, presentable, and technically grounded.
