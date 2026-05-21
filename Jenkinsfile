pipeline {
    agent any

    environment {
        SONAR_HOST = "http://sonarqube:9000"
        AI_ENGINE = "http://ai-engine:8000"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                url: 'https://github.com/YOUR_REPO.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                cd backend && npm install
                cd ../frontend && npm install
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh '''
                sonar-scanner \
                -Dsonar.projectKey=aerosec-tower \
                -Dsonar.sources=backend/src,frontend/src \
                -Dsonar.host.url=$SONAR_HOST \
                -Dsonar.login=$SONAR_TOKEN
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t aerosec-backend ./backend
                docker build -t aerosec-frontend ./frontend
                '''
            }
        }

        stage('Security Scan - Trivy') {
            steps {
                sh '''
                trivy image aerosec-backend
                trivy image aerosec-frontend
                '''
            }
        }

        stage('AI Security Gate') {
            steps {
                script {
                    def response = sh(
                        script: """
                        curl -s -X POST $AI_ENGINE/analyze \
                        -H 'Content-Type: application/json' \
                        -d '{"message":"Jenkins build security check","type":"pipeline"}'
                        """,
                        returnStdout: true
                    ).trim()

                    echo "AI Response: ${response}"

                    if (response.contains('"risk_score": 80') || response.contains('"risk_score": 9')) {
                        error("❌ Pipeline blocked by AI Security Engine")
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                docker compose up -d
                '''
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
