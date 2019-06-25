'use strict'

const getProject = require('./get-project')
const octopus = require('../octopus-deploy')
const paramsBuilder = require('./params-builder')
const { logger, Maybe } = require('../utils')

const executeCreateRelease = async releaseParams => {
  const { projectId, version } = releaseParams

  logger.info(`Creating release for project '${projectId}'`)

  const release = await octopus.releases.create(releaseParams)
  if (!release.hasValue) {
    logger.error(`Failed to create release for project '${projectId}'`)
    return Maybe.none()
  }

  logger.info(`Created release '${release.value.id}'. ${projectId} ${version}`)

  return release
}

const createRelease = async simpleReleaseParams => {
  const releaseParams = await paramsBuilder.buildReleaseParams(simpleReleaseParams)
  if (!releaseParams.hasValue) {
    return Maybe.none()
  }

  return executeCreateRelease(releaseParams.value)
}

const executeCreateDeployment = async (releaseId, environmentName, deployParams) => {
  const deployment = await octopus.deployments.create(releaseId, deployParams)
  if (!deployment.hasValue) {
    logger.error(`Failed to deploy release '${releaseId}' to '${environmentName}'`)
    return Maybe.none()
  }

  logger.info(`Deployed release '${releaseId}' to '${environmentName}'. DeploymentId: ${deployment.value.id}`)

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

  return executeCreateDeployment(release.value.id, environmentName, deployParams.value)
}

module.exports = {
  createRelease,
  createReleaseAndDeploy
}
