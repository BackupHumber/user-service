#!/usr/bin/env groovy
import java.util.Date
import groovy.json.*
def registryHost = "registry.humbergames.com/backend"
def projectRegistry = "registry.humbergames.com/backend/user-service";
def projectName = 'user-service'
def deploymentName = 'user-service'
def isMaster = env.gitlabSourceBranch == 'master'
def isStaging = env.BRANCH_NAME == 'master'
def baseName = env.JOB_BASE_NAME;
def start = new Date()
def err = null
def jobInfo = "${env.JOB_NAME} ${env.BUILD_DISPLAY_NAME} \n${env.BUILD_URL}"
// def imageTag = "${env.BUILD_NUMBER}"
def imageTag = "latest"
String jobInfoShort = "${env.JOB_NAME} ${env.BUILD_DISPLAY_NAME}"
String buildStatus
String timeSpent
currentBuild.result = "SUCCESS"
try {
    node {
        deleteDir()
        stage('initializing'){
                echo "Initializing"
                sh "printenv"
        }
        stage ('Checkout') {
            checkout scm
        }
        stage ('Push Docker to Registry') {
            sh "docker build -t ${registryHost}/${baseName}:${imageTag} ."
            sh "docker push ${registryHost}/${baseName}:${imageTag}"
        }
    }
} catch (caughtError) {
    err = caughtError
    currentBuild.result = "FAILURE"
} finally {
     timeSpent = "\nTime spent: ${timeDiff(start)}"
     echo timeSpent
    if (err) {
        sh "echo ${err}"
    } else {
        if (currentBuild.previousBuild == null) {
            buildStatus = '_First time build_'
        } else if (currentBuild.previousBuild.result == 'SUCCESS') {
            buildStatus = '_Build complete_'
        } else {
            buildStatus = '_Back to normal_'
        }
         echo "echo good"
    }
}
def timeDiff(st) {
    def delta = (new Date()).getTime() - st.getTime()
    def seconds = delta.intdiv(1000) % 60
    def minutes = delta.intdiv(60 * 1000) % 60
    return "${minutes} min ${seconds} sec"
}
