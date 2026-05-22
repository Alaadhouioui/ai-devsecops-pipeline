pipeline {
    agent any

    environment {
        SONAR_HOST = "http://192.168.56.128:9000"
        AI_ENGINE = "http://192.168.56.128:8001"
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
                    -Dsonar.host.url=http://192.168.56.128:9000 \
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
                trivy image aerosec-backend || true
                trivy image aerosec-frontend || true
                trivy image aerosec-ai-engine || true
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

                    if (
                        response.contains('"risk_score":80') ||
                        response.contains('"risk_score":90') ||
                        response.contains('"risk_level":"CRITICAL"')
                    ) {
                        error("Pipeline blocked by AI Security Engine")
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
                curl -f http://192.168.56.128:5000/health
                curl -f http://192.168.56.128:8001
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
