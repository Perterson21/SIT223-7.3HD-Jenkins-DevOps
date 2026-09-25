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

                powershell '''
                $docker = "C:\\Users\\CAT VIET\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe"

                $existing = & $docker ps -a --filter "name=uptime-kuma" --format "{{.Names}}"

                if ($existing -contains "uptime-kuma") {
                    Write-Host "Uptime Kuma container already exists."
                    & $docker start uptime-kuma
                }
                else {
                    Write-Host "Creating Uptime Kuma container..."

                    & $docker run -d `
                        --restart unless-stopped `
                        --name uptime-kuma `
                        -p 3004:3001 `
                        -v uptime-kuma:/app/data `
                        louislam/uptime-kuma:1
                }

                if ($LASTEXITCODE -ne 0) {
                    Write-Host "Failed to start Uptime Kuma."
                    exit 1
                }
                '''

                powershell '''
                Write-Host "Checking production application..."

                $prod = Invoke-WebRequest -UseBasicParsing http://localhost:3003

                Write-Host "Monitoring check - Production HTTP Status:" $prod.StatusCode

                if ($prod.StatusCode -ne 200) {
                    Write-Host "ALERT: Production application is unavailable."
                    exit 1
                }

                Write-Host "Production application is healthy."
                '''

                powershell '''
                Write-Host "Waiting for Uptime Kuma dashboard..."

                $ready = $false

                for ($i = 1; $i -le 12; $i++) {
                    try {
                        $response = Invoke-WebRequest -UseBasicParsing http://localhost:3004

                        if ($response.StatusCode -eq 200) {
                            Write-Host "Uptime Kuma HTTP Status:" $response.StatusCode
                            $ready = $true
                            break
                        }
                    }
                    catch {
                        Write-Host "Uptime Kuma is still starting..."
                    }

                    Start-Sleep -Seconds 5
                }

                if (-not $ready) {
                    Write-Host "Uptime Kuma did not become ready."
                    exit 1
                }

                Write-Host "Monitoring service is running successfully."
                '''
            }
        }
    }
}