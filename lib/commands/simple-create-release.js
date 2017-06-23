'use strict'

const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const logger = require('../logger')
const octopusApi = require('../octopus-deploy')

const simpleCreateRelease = (params) => {
  const { projectSlugOrId, version, releaseNotes } = params
  const packageVersion = params.packageVersion || version

  let projectId

  return getProject.execute(projectSlugOrId)
    .then(project => {
      projectId = project.Id

      return getSelectedPackages.execute(project.DeploymentProcessId, packageVersion)
    })
    .then(selectedPackages => {
      const releaseParams = { projectId, version, releaseNotes, selectedPackages }

      return octopusApi.releases.create(releaseParams)
    }).then(release => {
      logger.info(`Created release '${release.Id}'`)
      return release
    })
}

module.exports = simpleCreateRelease
