'use strict'

const BPromise = require('bluebird')

const logger = require('../utils/logger')

const getEnvironmentId = (variableSet, projectSlugOrId, environmentName) => {
  return new BPromise((resolve, reject) => {
    const environment = variableSet.scopeValues.environments.find(e => e.name === environmentName)
    if (!environment) {
      reject(Error(`Unable to find environment '${environmentName}' in variable set scope for project '${projectSlugOrId}'`))
    }

    logger.info(`Found environment ${environment.id} (${environmentName}) for deployment`)
    resolve(environment.id)
  })
}

module.exports.execute = getEnvironmentId
