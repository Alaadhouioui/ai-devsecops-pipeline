pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '20'))
        timeout(time: 45, unit: 'MINUTES')
    }

    environment {
        SONAR_HOST = "http://localhost:9000"
        AI_ENGINE = "http://localhost:8001"

        BACKEND_HEALTH_URL = "http://localhost:5000/health"
        AI_HEALTH_URL = "http://localhost:8001"

        IMAGE_TAG = "${BUILD_NUMBER}"
        NODE_OPTIONS = "--max-old-space-size=2048"
    }

    stages {

        stage('Checkout') {
            steps {
                cleanWs()
                checkout scm
            }
        }

        stage('Project Info') {
            steps {
                sh '''
                    echo "Workspace:"
                    pwd
                    ls -la App || true
                '''
            }
        }

        stage('Install Dependencies (Parallel)') {
            parallel {

                stage('Backend') {
                    steps {
                        dir('App/backend') {
                            sh 'npm ci'
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('App/frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        stage('Tests (Parallel)') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        dir('App/backend') {
                            sh 'npm test'
                        }
                    }
                }

                stage('AI Tests') {
                    steps {
                        sh 'python3 -m unittest discover -s App/ai-engine'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    withSonarQubeEnv('sonarqube') {
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=aerosec-tower \
                            -Dsonar.sources=App/backend/src,App/frontend/src \
                            -Dsonar.host.url=${SONAR_HOST} \
                            -Dsonar.javascript.node.maxspace=2048 \
                            -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/** \
                            -Dsonar.sourceEncoding=UTF-8 \
                            -Dsonar.qualitygate.wait=true
                        """
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                    docker build -t aerosec-backend:${IMAGE_TAG} App/backend
                    docker build -t aerosec-frontend:${IMAGE_TAG} App/frontend
                    docker build -t aerosec-ai-engine:${IMAGE_TAG} App/ai-engine
                """
            }
        }

        stage('Trivy Scan') {
            steps {
                script {
                    echo "🔍 Running Trivy Security Scan on all containers..."
                    sh """
                        # Backend Scan
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v /var/cache/trivy:/root/.cache/trivy
                          aquasec/trivy:latest image \
                          --skip-db-update \
                          --scanners vuln \
                          --no-progress \
                          --exit-code 1 \
                          --severity HIGH,CRITICAL \
                          aerosec-backend:${IMAGE_TAG}

                        # Frontend Scan
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v /var/cache/trivy:/root/.cache/trivy
                          aquasec/trivy:latest image \
                          --skip-db-update \
                          --scanners vuln \
                          --no-progress \
                          --exit-code 1 \
                          --severity HIGH,CRITICAL \
                          aerosec-frontend:${IMAGE_TAG}

                        # AI Engine Scan
                        docker run --rm \
                          -v /var/run/docker.sock:/var/run/docker.sock \
                          -v /var/cache/trivy:/root/.cache/trivy
                          aquasec/trivy:latest image \
                          --skip-db-update \
                          --scanners vuln \
                          --no-progress \
                          --exit-code 1 \
                          --severity HIGH,CRITICAL \
                          aerosec-ai-engine:${IMAGE_TAG}
                    """
                }
            }
        }

        stage('AI Security Gate') {
            steps {
                script {

                    def response = sh(
                        script: """
                            curl -s -X POST ${AI_ENGINE}/analyze \
                            -H 'Content-Type: application/json' \
                            -d '{"message":"pipeline security analysis","type":"devsecops"}'
                        """,
                        returnStdout: true
                    ).trim()

                    echo "AI RESPONSE: ${response}"

                    writeFile file: 'ai-report.json', text: response
                    archiveArtifacts artifacts: 'ai-report.json'

                    def json = readJSON text: response

                    if (json.risk_score >= 90 || json.risk_level == 'CRITICAL') {
                        error("BLOCKED by AI Security Engine")
                    }

                    if (json.risk_score >= 70 || json.risk_level == 'HIGH') {
                        unstable("AI Security Warning (manual review required)")
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    docker compose down || true
                    docker compose up -d --build
                """
            }
        }

        stage('Health Check') {
            steps {
                retry(3) {
                    sh """
                        curl -f ${BACKEND_HEALTH_URL}
                        curl -f ${AI_HEALTH_URL}
                    """
                }
            }
        }
    }

    post {
        success {
            echo "SUCCESS: Pipeline completed"
        }

        failure {
            echo "FAILED: Pipeline failed"
        }

        always {
            cleanWs()
        }
    }
}
