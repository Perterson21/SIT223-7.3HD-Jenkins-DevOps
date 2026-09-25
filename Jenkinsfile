stage('Security') {
    steps {
        echo 'Running npm security audit...'

        bat '''
        "C:\\Program Files\\nodejs\\npm.cmd" audit --json > npm-audit.json || exit /b 0
        '''

        archiveArtifacts artifacts: 'npm-audit.json', allowEmptyArchive: true
    }
}