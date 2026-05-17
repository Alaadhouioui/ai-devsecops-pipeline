# GitHub Webhook Flow

Use this flow for the DevSecOps demonstration:

1. Developer pushes to GitHub.
2. GitHub webhook calls Jenkins.
3. Jenkins installs dependencies, builds the app, and triggers quality gates.
4. SonarQube analyzes code quality.
5. Trivy scans dependencies and container images.
6. OWASP ZAP runs a baseline web security scan.
7. Docker images are built.
8. k3s receives the staging deployment.
9. AWS EC2 receives the approved demo deployment.

Suggested webhook event: `push` on the main branch.
