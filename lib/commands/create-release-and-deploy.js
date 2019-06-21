'use strict'

const { logger } = require('../utils/logger')
const { Maybe } = require('../utils/maybe')
const octopus = require('../octopus-deploy')

const createReleaseAndDeploy = async (releaseParams, deployParams) => {
  const release = await octopus.releases.create(releaseParams)
  if (!release.hasValue) {
    logger.error('Failed to create release')
    return Maybe.none()
  }

  const { id: releaseId } = release.value
  logger.info(`Created release '${releaseId}'`)

  const maybeDeployment = await octopus.deployments.create(releaseId, deployParams)
  if (!maybeDeployment.hasValue) {
    logger.error('Failed to create deployment')
    return Maybe.none()
  }

  logger.info(`Deployed '${maybeDeployment.value.id}'`)

  return maybeDeployment
}

module.exports.execute = createReleaseAndDeploy
