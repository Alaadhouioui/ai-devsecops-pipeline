pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        SONAR_HOST = "http://192.168.56.128:9000"
        AI_ENGINE = "http://192.168.56.128:8001"
        BACKEND_HEALTH_URL = "http://192.168.56.128:5000/health"
        AI_HEALTH_URL = "http://192.168.56.128:8001"
        SONAR_TOKEN = credentials('sonar-token')
        NODE_OPTIONS = "--max-old-space-size=2048"
    }

    stages {

        stage('Checkout Source') {
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
                            sh '''
                                npm ci || npm install
                            '''
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        dir('App/frontend') {
                            sh '''
                                npm ci || npm install
                            '''
                        }
                    }
                }
            }
        }

        stage('Test Suite (Parallel)') {
            parallel {

                stage('Backend Tests') {
                    steps {
                        dir('App/backend') {
                            sh 'npm test || true'
                        }
                    }
                }

                stage('AI Tests') {
                    steps {
                        sh 'python3 -m unittest discover -s App/ai-engine || true'
                    }
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'sonar-scanner'

                    retry(2) {
                        timeout(time: 5, unit: 'MINUTES') {
                            withSonarQubeEnv('sonarqube') {
                                sh """
                                    ${scannerHome}/bin/sonar-scanner \
                                    -Dsonar.projectKey=aerosec-tower \
                                    -Dsonar.sources=App/backend/src,App/frontend/src \
                                    -Dsonar.host.url=${SONAR_HOST} \
                                    -Dsonar.login=${SONAR_TOKEN} \
                                    -Dsonar.ws.timeout=300
                                """
                            }
                        }
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
                sh '''
                    docker build -t aerosec-backend App/backend
                    docker build -t aerosec-frontend App/frontend
                    docker build -t aerosec-ai-engine App/ai-engine
                '''
            }
        }

        stage('Security Scan (Trivy)') {
            steps {
                sh '''
                    trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-backend || true
                    trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-frontend || true
                    trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-ai-engine || true
                '''
            }
        }

        stage('AI Security Gate') {
            steps {
                script {
                    timeout(time: 2, unit: 'MINUTES') {

                        def response = sh(
                            script: """
                                curl -s -X POST ${AI_ENGINE}/analyze \
                                -H 'Content-Type: application/json' \
                                -d '{"message":"Jenkins pipeline security analysis","type":"pipeline"}'
                            """,
                            returnStdout: true
                        ).trim()

                        echo "AI RESPONSE: ${response}"

                        def aiResult = new groovy.json.JsonSlurperClassic().parseText(response)

                        if (aiResult.risk_score >= 90 || aiResult.risk_level == 'CRITICAL') {
                            error("BLOCKED by AI Security Engine")
                        }

                        if (aiResult.risk_score >= 70 || aiResult.risk_level == 'HIGH') {
                            unstable("WARNING: Manual review required")
                        }
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    docker compose up -d --build
                '''
            }
        }

        stage('Post Deployment Health Check') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    sh '''
                        curl -f ${BACKEND_HEALTH_URL}
                        curl -f ${AI_HEALTH_URL}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }

        failure {
            echo "❌ Pipeline failed - check logs"
        }

        always {
            cleanWs()
        }
    }
}
