pipeline {
agent any

```
options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(
        numToKeepStr: '20',
        artifactNumToKeepStr: '20'
    ))
    timeout(time: 60, unit: 'MINUTES')
}

environment {
    SONAR_HOST = "http://192.168.56.128:9000"
    AI_ENGINE = "http://192.168.56.128:8001"

    BACKEND_HEALTH_URL = "http://192.168.56.128:5000/health"
    AI_HEALTH_URL = "http://192.168.56.128:8001"

    IMAGE_TAG = "${BUILD_NUMBER}"

    NODE_OPTIONS = "--max-old-space-size=2048"

    SONAR_TOKEN = credentials('sonar-token')
}

stages {

    stage('Checkout Source') {
        steps {
            cleanWs()
            checkout scm

            sh '''
            echo "Commit:"
            git rev-parse HEAD

            echo "Branch:"
            git branch
            '''
        }
    }

    stage('Install Dependencies') {
        parallel {

            stage('Backend Dependencies') {
                steps {
                    dir('App/backend') {
                        sh '''
                        npm ci || npm install
                        '''
                    }
                }
            }

            stage('Frontend Dependencies') {
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

    stage('Dependency Security Scan') {
        parallel {

            stage('Backend Audit') {
                steps {
                    dir('App/backend') {
                        sh '''
                        npm audit --audit-level=high || true
                        '''
                    }
                }
            }

            stage('Frontend Audit') {
                steps {
                    dir('App/frontend') {
                        sh '''
                        npm audit --audit-level=high || true
                        '''
                    }
                }
            }
        }
    }

    stage('Run Tests') {
        parallel {

            stage('Backend Tests') {
                steps {
                    dir('App/backend') {
                        sh '''
                        npm test || true
                        '''
                    }
                }
            }

            stage('AI Engine Tests') {
                steps {
                    sh '''
                    python3 -m unittest discover -s App/ai-engine || true
                    '''
                }
            }
        }
    }

    stage('SonarQube Analysis') {
        steps {

            script {
                def scannerHome = tool 'sonar-scanner'

                withSonarQubeEnv('sonarqube') {

                    sh '''
                    export SONAR_SCANNER_OPTS="-Xmx1024m"
                    '''

                    sh """
                    ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=aerosec-tower \
                    -Dsonar.sources=App/backend/src,App/frontend/src \
                    -Dsonar.host.url=${SONAR_HOST} \
                    -Dsonar.token=$SONAR_TOKEN \
                    -Dsonar.scanner.socketTimeout=300 \
                    -Dsonar.javascript.node.maxspace=2048 \
                    -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }
    }

    stage('Quality Gate') {
        steps {
            timeout(time: 10, unit: 'MINUTES') {
                waitForQualityGate abortPipeline: true
            }
        }
    }

    stage('Build Docker Images') {
        steps {

            sh '''
            docker build -t aerosec-backend:${IMAGE_TAG} App/backend
            docker build -t aerosec-frontend:${IMAGE_TAG} App/frontend
            docker build -t aerosec-ai-engine:${IMAGE_TAG} App/ai-engine
            '''

        }
    }

    stage('Trivy Image Scan') {
        steps {

            sh '''
            trivy image \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            aerosec-backend:${IMAGE_TAG}

            trivy image \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            aerosec-frontend:${IMAGE_TAG}

            trivy image \
            --severity HIGH,CRITICAL \
            --exit-code 1 \
            aerosec-ai-engine:${IMAGE_TAG}
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
                        "message":"Jenkins DevSecOps Pipeline Analysis",
                        "type":"pipeline"
                    }'
                    """,
                    returnStdout: true
                ).trim()

                writeFile(
                    file: 'ai-security-report.json',
                    text: response
                )

                archiveArtifacts(
                    artifacts: 'ai-security-report.json',
                    fingerprint: true
                )

                def result =
                new groovy.json.JsonSlurperClassic()
                .parseText(response)

                echo "AI Risk Score: ${result.risk_score}"
                echo "AI Risk Level: ${result.risk_level}"

                if (
                    result.risk_score >= 90 ||
                    result.risk_level == 'CRITICAL'
                ) {
                    error("Blocked by AI Security Engine")
                }

                if (
                    result.risk_score >= 70 ||
                    result.risk_level == 'HIGH'
                ) {
                    unstable("Manual review required")
                }
            }
        }
    }

    stage('Deploy') {
        steps {

            sh '''
            docker compose down || true
            docker compose up -d --build
            '''
        }
    }

    stage('Health Verification') {
        steps {

            retry(3) {

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
        echo "Pipeline completed successfully"
    }

    unstable {
        echo "Pipeline completed with warnings"
    }

    failure {
        echo "Pipeline failed"
    }

    always {

        sh '''
        docker image prune -f || true
        '''

        cleanWs()
    }
}
```

}
