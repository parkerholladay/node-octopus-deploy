'use strict'

const { logger } = require('../utils/logger')
const { Maybe } = require('../utils/maybe')

const getEnvironmentId = (variableSet, projectSlugOrId, environmentName) => {
  const environment = variableSet.scopeValues.environments.find(e => e.name === environmentName)
  if (!environment) {
    logger.error(`Environment '${environmentName}' not found in variable set scope for project '${projectSlugOrId}'`)
    return Maybe.none()
  }

  logger.info(`Found environment ${environment.id} (${environmentName}) for deployment`)

  return Maybe.some(environment.id)
}

module.exports.execute = getEnvironmentId
