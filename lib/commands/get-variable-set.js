'use strict'

const api = require('../api')
const { logger } = require('../utils')

const getVariableSet = async id => {
  const variableSet = await api.variables.find(id)
  if (!variableSet.hasValue) {
    logger.error(`Variable set '${id}' not found`)
  }

  return variableSet
}

module.exports.execute = getVariableSet
