'use strict'

const { logger } = require('../utils/logger')
const { Maybe } = require('../utils/maybe')

const getVariableId = (variables, variableName, environmentId, environmentName) => {
  const foundVariables = variables.filter(v => v.name === variableName && v.scope.environment.includes(environmentId))

  if (foundVariables.length <= 0) {
    logger.error(`No variable '${variableName}' with scope '${environmentName}' found in variable set`)
    return null
  }
  if (foundVariables.length > 1) {
    logger.error(`More than one variable '${variableName}' with scope '${environmentName}' found in variable set`)
    return null
  }

  return foundVariables[0].id
}

const getFormValues = (variables, variableSet, environmentId, environmentName) => {
  logger.info('Preparing form values from variables')

  const result = Object.entries(variables).reduce((result, [variableName, variable]) => {
    const variableId = getVariableId(variableSet.variables, variableName, environmentId, environmentName)
    if (!variableId) {
      return {
        ...result,
        isValid: false
      }
    }

    return {
      ...result,
      formValues: {
        ...result.formValues,
        [variableId]: variable
      }
    }
  }, { formValues: {}, isValid: true })

  if (!result.isValid) {
    return Maybe.none()
  }

  return Maybe.some(result.formValues)
}

module.exports.execute = getFormValues
