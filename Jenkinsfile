pipeline {
    agent any

    stages {
        stage('Restore NuGet Packages') {
            steps {
                bat 'dotnet restore backend/CozyHavenStay.API/CozyHavenStay.API.slnx'
            }
        }

        stage('Build C# Backend') {
            steps {
                bat 'dotnet build backend/CozyHavenStay.API/CozyHavenStay.API.slnx --configuration Release --no-restore /nodeReuse:false /maxCpuCount:1'
            }
        }

        stage('Run Backend Unit Tests') {
            steps {
                bat 'dotnet test backend/CozyHavenStay.Tests/CozyHavenStay.Tests.csproj --configuration Release --no-build --verbosity normal'
            }
        }

        stage('Build React Frontend') {
            steps {
                dir('frontend') {
                    bat 'rmdir /s /q node_modules 2>nul || exit 0'
                    bat 'npm install --legacy-peer-deps'
                    bat 'set DISABLE_ESLINT_PLUGIN=true&& set CI=false&& npm run build'
                }
            }
        }
    }
}
