'use strict'

const BPromise = require('bluebird')

const logger = require('../logger')

function getVariableId(variables, variableName, environmentId, environmentName) {
  const foundVariables = variables.filter(varWithScope => {
    return varWithScope.Name === variableName &&
      varWithScope.Scope.Environment.includes(environmentId)
  })

  if (foundVariables.length <= 0)
    throw new Error(`No variable '${variableName}' with scope '${environmentName}' found in variable set`)
  if (foundVariables.length > 1)
    throw new Error(`More than one variable '${variableName}' with scope '${environmentName}' found in variable set`)

  return foundVariables[0].Id
}

const getFormValues = (variables, variableSet, environmentId, environmentName) => {
  logger.info('Preparing form values from variables')
  return new BPromise((resolve, reject) => {
    let formValues = {}

    Object.keys(variables).map(variableName => {
      try {
        const variableId = getVariableId(variableSet.Variables, variableName, environmentId, environmentName)
        formValues[variableId] = variables[variableName]
      } catch (err) {
        reject(err)
      }
    })

    resolve(formValues)
  })
}

module.exports.execute = getFormValues
