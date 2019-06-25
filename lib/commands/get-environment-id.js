'use strict'

const { logger, Maybe } = require('../utils')

const getEnvironmentId = (variableSet, projectId, environmentName) => {
  const environment = variableSet.scopeValues.environments.find(e => e.name === environmentName)
  if (!environment) {
    logger.error(`Environment '${environmentName}' not found in variable set scope for project '${projectId}'`)
    return Maybe.none()
  }

  logger.info(`Found environment '${environment.id}' (${environmentName}) for '${projectId}'`)

  return Maybe.some(environment.id)
}

module.exports.execute = getEnvironmentId
