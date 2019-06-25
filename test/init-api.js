'use strict'

const { testConfig } = require('./api-config')
const { clearApiConfig, setApiConfig } = require('../lib/utils')

beforeEach(() => {
  setApiConfig(testConfig)
})
afterEach(() => {
  clearApiConfig()
})
