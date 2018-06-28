'use strict'

const octo = require('../')
const logger = require('../utils/logger')

const createReleaseAndDeploy = (releaseParams, deployParams) => {
  return octo.api.releases.create(releaseParams)
    .then(release => {
      logger.info(`Created release '${release.id}'`)
      return octo.api.deployments.create(release.id, deployParams)
    })
    .then(deployment => {
      logger.info(`Deployed '${deployment.id}'`)
      return deployment
    })
}

module.exports.execute = createReleaseAndDeploy
