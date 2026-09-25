pipeline {
    agent any

    stages {

        stage('Build') {
            steps {
                echo 'Checking Docker...'

                bat '"C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" --version'

                echo 'Building SIT223 Docker image...'

                bat '"C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" build -t sit223-goof:%BUILD_NUMBER% .'
            }
        }

        stage('Test') {
            steps {
                echo 'Running automated unit tests...'

                bat '"C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" run --rm --entrypoint node sit223-goof:%BUILD_NUMBER% tests/utils.test.js'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Running SonarQube code quality analysis...'

                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        bat "\"${scannerHome}\\bin\\sonar-scanner.bat\""
                    }
                }
            }
        }

        stage('Security') {
            steps {
                echo 'Running npm security audit...'

                bat '''
                "C:\\Program Files\\nodejs\\npm.cmd" audit --json > npm-audit.json || exit /b 0
                '''

                archiveArtifacts artifacts: 'npm-audit.json', allowEmptyArchive: true
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application to staging environment...'

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" rm -f sit223-staging 2>NUL || echo No existing staging container
                '''

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" run -d ^
                --name sit223-staging ^
                --network nodejs-goof_default ^
                -e DOCKER=1 ^
                -p 3002:3001 ^
                sit223-goof:%BUILD_NUMBER%
                '''

                powershell 'Start-Sleep -Seconds 8'

                powershell '''
                $response = Invoke-WebRequest -UseBasicParsing http://localhost:3002
                Write-Host "Staging HTTP Status:" $response.StatusCode

                if ($response.StatusCode -ne 200) {
                    exit 1
                }
                '''
            }
        }
    }
}