'use strict'

const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const createReleaseAndDeploy = (releaseParams, deployParams) => {
  const { projectId, version, releaseNotes, selectedPackages } = releaseParams

  return octopusApi.releases.create(projectId, version, releaseNotes, selectedPackages)
    .then(release => {
      logger.info(`Created release '${release.Id}'`)
      return octopusApi.deployments.create(deployParams)
    })
    .then(deployment => {
      logger.info(`Deployed '${deployment.Id}'`)
      return deployment
    })
}

module.exports.execute = createReleaseAndDeploy
