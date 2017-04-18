'use strict'

const BPromise = require('bluebird')

const logger = require('../logger')

const getEnvironmentId = (variableSet, projectSlugOrId, environmentName) => {
  return new BPromise((resolve, reject) => {
    const environment = variableSet.ScopeValues.Environments.find(env => env.Name === environmentName)
    if (!environment)
      reject(Error(`Unable to find environment '${environmentName}' in variable set scope for project '${projectSlugOrId}'`))

    logger.info(`Found environment ${environment.Id} (${environmentName}) for deployment`)
    resolve(environment.Id)
  })
}

module.exports.execute = getEnvironmentId
