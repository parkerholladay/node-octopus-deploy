const testConfig = require('./client-config')
const octopus = require('../lib/octopus-deploy')

beforeEach(() => {
  octopus.init(testConfig)
})
afterEach(() => {
  octopus.close()
})
