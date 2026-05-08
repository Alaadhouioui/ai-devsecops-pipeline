pipeline {
    agent any

    environment {
        SONARQUBE_URL = "http://sonarqube:9000"
        AI_ENGINE_URL = "http://192.168.56.131:8000/risk"
    }

    stages {

        stage("Checkout Code") {
            steps {
                git branch: 'main',
                url: 'https://github.com/YOUR_USERNAME/ai-devsecops-pipeline.git'
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                    sonar-scanner \
                    -Dsonar.projectKey=devsecops \
                    -Dsonar.sources=. \
                    -Dsonar.host.url=${SONARQUBE_URL} \
                    -Dsonar.login=$SONAR_TOKEN
                    """
                }
            }
        }

        stage("Simulate Vulnerability Extraction") {
            steps {
                script {
                    // temporary (later we replace with real SonarQube API parsing)
                    env.VULNERABILITIES = "5"
                    echo "Detected vulnerabilities: ${env.VULNERABILITIES}"
                }
            }
        }

        stage("AI Risk Evaluation") {
            steps {
                script {
                    def response = sh(
                        script: """
                        curl -s -X POST ${AI_ENGINE_URL} \
                        -H 'Content-Type: application/json' \
                        -d '{ "vulnerabilities": ${VULNERABILITIES} }'
                        """,
                        returnStdout: true
                    ).trim()

                    echo "AI Response: ${response}"

                    env.RISK_SCORE = sh(
                        script: "echo '${response}' | grep -o '0\\.[0-9]*\\|1\\.0'",
                        returnStdout: true
                    ).trim()

                    echo "Risk Score: ${RISK_SCORE}"
                }
            }
        }

        stage("Security Gate (AI Decision)") {
            steps {
                script {
                    if (RISK_SCORE.toFloat() > 0.7) {
                        error("🚨 BLOCKED: High risk detected by AI engine")
                    } else {
                        echo "✅ Approved by AI risk engine"
                    }
                }
            }
        }

        stage("Build Application") {
            steps {
                echo "Building application..."
                sh "echo build step placeholder"
            }
        }

        stage("Deploy") {
            steps {
                echo "Deploying application..."
                sh "echo deployment successful"
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline SUCCESS"
        }

        failure {
            echo "❌ Pipeline FAILED or BLOCKED"
        }
    }
}
