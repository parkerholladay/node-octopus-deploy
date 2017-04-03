'use strict'

const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const octopusApi = require('../octopus-deploy')

const simpleCreateRelease = (params) => {
  const { projectSlugOrId, version, releaseNotes, packageVersion } = params

  let projectId

  return getProject.execute(projectSlugOrId)
    .then(project => {
      projectId = project.Id

      return getSelectedPackages.execute(project.DeploymentProcessId, packageVersion)
    })
    .then(selectedPackages => {
      return octopusApi.releases.create(projectId, version, releaseNotes, selectedPackages)
    })
}

module.exports = simpleCreateRelease
