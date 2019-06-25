'use strict'

let clientConfig = null

const getApiConfig = () => {
  if (!clientConfig) {
    throw new Error('client config has not been set')
  }

  return clientConfig
}

const setApiConfig = config => {
  const requiredConfig = [
    'host',
    'apiKey'
  ]

  if (!config) {
    throw new Error(`client config is required`)
  }

  for (const key of requiredConfig) {
    if (!config[key]) {
      throw new Error(`${key} is required in client config`)
    }
  }

  clientConfig = config
}

const clearApiConfig = () => {
  clientConfig = null
}

module.exports = {
  clearApiConfig,
  getApiConfig,
  setApiConfig
}
