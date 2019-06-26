'use strict'

const api = require('../api')
const getProject = require('./get-project')
const paramsBuilder = require('./params-builder')
const { logger, Maybe } = require('../utils')

const executeCreateRelease = async releaseParams => {
  const { projectId, version } = releaseParams

  logger.info(`Creating release for project '${projectId}'`)

  const release = await api.releases.create(releaseParams)
  if (!release.hasValue) {
    logger.error(`Failed to create release for project '${projectId}'`)
    return Maybe.none()
  }

  logger.info(`Created release '${release.value.id}'. Project: ${projectId}; Version: ${version}`)

  return release
}

const createRelease = async simpleReleaseParams => {
  const releaseParams = await paramsBuilder.buildReleaseParams(simpleReleaseParams)
  if (!releaseParams.hasValue) {
    return Maybe.none()
  }

  return executeCreateRelease(releaseParams.value)
}

const executeCreateDeployment = async (deployParams, environmentName) => {
  const { releaseId } = deployParams

  const deployment = await api.deployments.create(deployParams)
  if (!deployment.hasValue) {
    logger.error(`Failed to deploy release '${releaseId}' to '${environmentName}'`)
    return Maybe.none()
  }

  logger.info(`Deployed release '${releaseId}' to '${environmentName}'. Deployment: ${deployment.value.id}`)

  return deployment
}

const createReleaseAndDeploy = async (simpleReleaseParams, simpleDeployParams) => {
  const { projectSlugOrId } = simpleReleaseParams
  const { environmentName } = simpleDeployParams

  const project = await getProject.execute(projectSlugOrId)
  if (!project.hasValue) {
    return Maybe.none()
  }

  const [releaseParams, deployParams] = await Promise.all([
    paramsBuilder.buildReleaseParams(simpleReleaseParams, project.value),
    paramsBuilder.buildDeployParams(simpleDeployParams, project.value)
  ])

  if (!releaseParams.hasValue || !deployParams.hasValue) {
    return Maybe.none()
  }

  const release = await executeCreateRelease(releaseParams.value)
  if (!release.hasValue) {
    return Maybe.none()
  }

  return executeCreateDeployment({ ...deployParams.value, releaseId: release.value.id }, environmentName)
}

module.exports = {
  createRelease,
  createReleaseAndDeploy
}
