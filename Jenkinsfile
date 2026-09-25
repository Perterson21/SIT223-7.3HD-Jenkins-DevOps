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
    }
}