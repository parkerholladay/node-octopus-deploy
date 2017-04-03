'use strict'

const octopusApi = require('../octopus-deploy')

const createReleaseAndDeploy = (releaseParams, deployParams) => {
  const { projectId, version, releaseNotes, selectedPackages } = releaseParams
  const { environmentId, comments, formValues } = deployParams

  return octopusApi.releases.create(projectId, version, releaseNotes, selectedPackages)
    .then(release => {
      return octopusApi.deployments.create(environmentId, release.Id, comments, formValues)
    })
    .then(deployment => (deployment))
}

module.exports.execute = createReleaseAndDeploy
