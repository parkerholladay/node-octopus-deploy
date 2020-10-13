'use strict'

const api = require('../api')
const { logger, Maybe } = require('../utils')

const getProject = async projectSlugOrId => {
  const project = await api.projects.find(projectSlugOrId)
  if (!project.hasValue) {
    logger.error(`Project '${projectSlugOrId}' not found`)
    return Maybe.none()
  }

  const { id: projectId, name: projectName, variableSetId, deploymentProcessId } = project.value
  if (!variableSetId) {
    logger.error(`VariableSetId is not set on project '${projectId}' (${projectName})`)
    return Maybe.none()
  }
  if (!deploymentProcessId) {
    logger.error(`DeploymentProcessId is not set on project '${projectId}' (${projectName})`)
    return Maybe.none()
  }

  logger.info(`Found project '${projectId}' (${projectName})`)

  return project
}

module.exports.execute = getProject
