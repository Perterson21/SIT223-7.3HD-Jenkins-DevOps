pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Checking Docker...'
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" --version'

                echo 'Building SIT223 Docker image...'
                bat '"C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe" build -t sit223-goof:%BUILD_NUMBER% .'
            }
        }
    }
}