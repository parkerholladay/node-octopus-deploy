'use strict'

const octopus = require('../octopus-deploy')
const { logger, Maybe } = require('../utils')

const getProject = async projectSlugOrId => {
  const project = await octopus.projects.find(projectSlugOrId)
  if (!project.hasValue) {
    logger.error(`Project '${projectSlugOrId}' not found`)
    return Maybe.none()
  }

  const { id: projectId, variableSetId, deploymentProcessId } = project.value
  if (!variableSetId) {
    logger.error(`VariableSetId is not set on project '${projectSlugOrId}'`)
    return Maybe.none()
  }
  if (!deploymentProcessId) {
    logger.error(`DeploymentProcessId is not set on project '${projectSlugOrId}'`)
    return Maybe.none()
  }

  logger.info(`Found project '${projectId}'`)

  return project
}

module.exports.execute = getProject
