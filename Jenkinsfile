pipeline {
    agent any

    environment {
        SONAR_HOST = "http://192.168.56.128:9000"
        AI_ENGINE = "http://192.168.56.128:8001"
        BACKEND_HEALTH_URL = "http://192.168.56.128:5000/health"
        AI_HEALTH_URL = "http://192.168.56.128:8001"
        SONAR_TOKEN = credentials('sonar-token')
    }

    stages {

        stage('Project Info') {
            steps {
                echo "Starting AeroSec DevSecOps Pipeline..."
                sh 'pwd'
                sh 'ls -la'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                sh '''
                cd App/backend
                npm install
                '''
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                sh '''
                cd App/frontend
                npm install
                '''
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh '''
                cd App/backend
                npm test
                '''
            }
        }

        stage('Run AI Engine Tests') {
            steps {
                sh '''
                python3 -m unittest discover -s App/ai-engine
                '''
            }
        }

       stage('SonarQube Analysis') {
    steps {
        script {
            def scannerHome = tool 'sonar-scanner'
            
            withSonarQubeEnv('sonarqube') {
                sh """
                    cd App

                    ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=aerosec-tower \
                    -Dsonar.sources=backend/src,frontend/src \
                    -Dsonar.host.url=${SONAR_HOST} \
                    -Dsonar.login=${SONAR_TOKEN}
                """
            }
        }
    }
}

        stage('Build Docker Images') {
            steps {
                sh '''
                cd App

                docker build -t aerosec-backend ./backend
                docker build -t aerosec-frontend ./frontend
                docker build -t aerosec-ai-engine ./ai-engine
                '''
            }
        }

        stage('Trivy Security Scan') {
            steps {
                sh '''
                trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-backend
                trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-frontend
                trivy image --exit-code 1 --severity HIGH,CRITICAL aerosec-ai-engine
                '''
            }
        }

        stage('AI Security Gate') {
            steps {
                script {

                    def response = sh(
                        script: """
                        curl -s -X POST ${AI_ENGINE}/analyze \
                        -H 'Content-Type: application/json' \
                        -d '{
                            "message":"Jenkins pipeline security analysis",
                            "type":"pipeline"
                        }'
                        """,
                        returnStdout: true
                    ).trim()

                    echo "AI RESPONSE: ${response}"

                    def aiResult = new groovy.json.JsonSlurperClassic().parseText(response)
                    def riskScore = aiResult.risk_score as Integer
                    def riskLevel = aiResult.risk_level as String
                    def recommendedAction = aiResult.recommended_action as String

                    if (riskScore >= 90 || riskLevel == 'CRITICAL' || recommendedAction == 'block') {
                        error("Pipeline blocked by AI Security Engine: ${riskLevel} risk (${riskScore})")
                    }

                    if (riskScore >= 70 || riskLevel == 'HIGH' || recommendedAction == 'manual-review') {
                        unstable("AI Security Engine requires manual review: ${riskLevel} risk (${riskScore})")
                    }
                }
            }
        }

        stage('Deploy Application') {
            steps {
                sh '''
                cd App
                docker compose up --build -d
                '''
            }
        }

        stage('Deployment Verification') {
            steps {
                sh '''
                curl -f ${BACKEND_HEALTH_URL}
                curl -f ${AI_HEALTH_URL}
                '''
            }
        }
    }

    post {

        success {
            echo 'AeroSec pipeline completed successfully'
        }

        failure {
            echo 'AeroSec pipeline failed'
        }

        always {
            cleanWs()
        }
    }
}
