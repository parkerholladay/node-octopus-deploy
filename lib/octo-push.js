'use strict'

const api = require('./octopus-deploy')
const logger = require('./utils/logger')

const octopush = params => {
  const { name, version, extension, replace, stream } = params
  const fileName = `${name}.${version}.${extension}`
  logger.info(`Publishing package ${fileName}...`)

  return api.packages.create(fileName, replace, stream)
}

module.exports = octopush
