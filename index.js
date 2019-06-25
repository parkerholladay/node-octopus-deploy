'use strict'

const api = require('./lib/api')
const { setApiConfig } = require('./lib/utils')

module.exports = {
  initializeApi: setApiConfig,
  octopusApi: api
}
