pipeline {
    agent any

    stages {
        stage('Build') {
            steps {
                echo 'Building SIT223 Docker image...'
                bat 'docker build -t sit223-goof:%BUILD_NUMBER% .'
            }
        }
    }
}