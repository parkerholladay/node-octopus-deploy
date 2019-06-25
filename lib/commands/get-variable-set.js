'use strict'

const octopus = require('../octopus-deploy')
const { logger } = require('../utils')

const getVariableSet = async id => {
  const variableSet = await octopus.variables.find(id)
  if (!variableSet.hasValue) {
    logger.error(`Variable set '${id}' not found`)
  }

  return variableSet
}

module.exports.execute = getVariableSet
