'use strict'

const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const createReleaseAndDeploy = (releaseParams, deployParams) => {
  return octopusApi.releases.create(releaseParams)
    .then(release => {
      logger.info(`Created release '${release.id}'`)
      return octopusApi.deployments.create(release.id, deployParams)
    })
    .then(deployment => {
      logger.info(`Deployed '${deployment.id}'`)
      return deployment
    })
}

module.exports.execute = createReleaseAndDeploy
