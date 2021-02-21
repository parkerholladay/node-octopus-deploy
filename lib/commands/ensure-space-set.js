'use strict'

const api = require('../api')
const { logger, setApiConfig, getApiConfig } = require('../utils')

const setSpaceByName = async name => {
  if (!name) {
    return
  }

  const queryResult = await api.spaces.findAll()
  const spaces = queryResult.valueOrDefault([])

  const space = spaces.find(x => x.name === name)
  if (!space) {
    logger.error(`Space '${name}' not found`)
    throw new Error(`Unable to set space '${name}'`)
  }

  const { id: spaceId } = space

  logger.info(`Using Space '${spaceId}' (${name})`)
  const config = getApiConfig()
  setApiConfig({ ...config, spaceId })
}

module.exports.execute = setSpaceByName
