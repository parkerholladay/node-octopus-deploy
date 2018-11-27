'use strict'

const BPromise = require('bluebird')

const logger = require('../utils/logger')

const getVariableId = (variables, variableName, environmentId, environmentName) => {
  const foundVariables = variables.filter(v => {
    return v.name === variableName &&
      v.scope.environment.includes(environmentId)
  })

  if (foundVariables.length <= 0) {
    throw new Error(`No variable '${variableName}' with scope '${environmentName}' found in variable set`)
  }
  if (foundVariables.length > 1) {
    throw new Error(`More than one variable '${variableName}' with scope '${environmentName}' found in variable set`)
  }

  return foundVariables[0].id
}

const getFormValues = (variables, variableSet, environmentId, environmentName) => {
  logger.info('Preparing form values from variables')
  return new BPromise((resolve, reject) => {
    let formValues = {}

    Object.keys(variables).map(variableName => {
      try {
        const variableId = getVariableId(variableSet.variables, variableName, environmentId, environmentName)
        formValues[variableId] = variables[variableName]
      } catch (err) {
        reject(err)
      }
    })

    resolve(formValues)
  })
}

module.exports.execute = getFormValues
