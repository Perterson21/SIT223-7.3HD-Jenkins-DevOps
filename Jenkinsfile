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

        stage('Release') {
            steps {
                echo 'Promoting tested image to production release...'

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" tag sit223-goof:%BUILD_NUMBER% sit223-goof:release-%BUILD_NUMBER%
                '''

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" rm -f sit223-production 2>NUL || echo No existing production container
                '''

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" run -d ^
                --name sit223-production ^
                --network nodejs-goof_default ^
                -e DOCKER=1 ^
                -p 3003:3001 ^
                sit223-goof:release-%BUILD_NUMBER%
                '''

                powershell 'Start-Sleep -Seconds 8'

                powershell '''
                $response = Invoke-WebRequest -UseBasicParsing http://localhost:3003
                Write-Host "Production HTTP Status:" $response.StatusCode

                if ($response.StatusCode -ne 200) {
                    exit 1
                }
                '''
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Starting production monitoring with Uptime Kuma...'

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" inspect uptime-kuma >NUL 2>&1 || ^
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" run -d ^
                --restart unless-stopped ^
                --name uptime-kuma ^
                -p 3004:3001 ^
                -v uptime-kuma:/app/data ^
                louislam/uptime-kuma:1
                '''

                bat '''
                "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" start uptime-kuma >NUL 2>&1 || echo Uptime Kuma already running
                '''

                powershell '''
                Write-Host "Checking production application..."

                $prod = Invoke-WebRequest -UseBasicParsing http://localhost:3003
                Write-Host "Monitoring check - Production HTTP Status:" $prod.StatusCode

                if ($prod.StatusCode -ne 200) {
                    Write-Host "ALERT: Production application is unavailable"
                    exit 1
                }

                Write-Host "Production application is healthy."
                '''

                powershell '''
                Write-Host "Waiting for Uptime Kuma monitoring dashboard..."

                $success = $false

                for ($i = 1; $i -le 12; $i++) {
                    try {
                        $monitor = Invoke-WebRequest -UseBasicParsing http://localhost:3004

                        if ($monitor.StatusCode -eq 200) {
                            Write-Host "Uptime Kuma HTTP Status:" $monitor.StatusCode
                            $success = $true
                            break
                        }
                    }
                    catch {
                        Write-Host "Waiting for monitoring service..."
                    }

                    Start-Sleep -Seconds 5
                }

                if (-not $success) {
                    Write-Host "Monitoring service did not start successfully."
                    exit 1
                }

                Write-Host "Monitoring service is running successfully."
                '''
            }
        }
    }
}