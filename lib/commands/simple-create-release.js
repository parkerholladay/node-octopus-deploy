'use strict'

const getProject = require('./get-project')
const getSelectedPackages = require('./get-selected-packages')
const { Maybe } = require('../utils/maybe')
const { logger } = require('../utils/logger')
const octopus = require('../octopus-deploy')

const simpleCreateRelease = async params => {
  const { projectSlugOrId, version, releaseNotes } = params
  const packageVersion = params.packageVersion || version

  const project = await getProject.execute(projectSlugOrId)
  if (!project.hasValue) {
    return Maybe.none()
  }

  const { id: projectId, deploymentProcessId } = project.value

  const selectedPackages = await getSelectedPackages.execute(deploymentProcessId, packageVersion)
  if (!selectedPackages.length) {
    return Maybe.none()
  }

  const releaseParams = { projectId, version, releaseNotes, selectedPackages }

  const release = await octopus.releases.create(releaseParams)
  if (!release.hasValue) {
    logger.error(`Failed to create release for '${projectSlugOrId}'`)
    return Maybe.none()
  }

  logger.info(`Created release '${release.value.id}'`)

  return release
}

module.exports.execute = simpleCreateRelease
