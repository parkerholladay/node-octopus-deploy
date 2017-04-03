'use strict'

const { expect } = require('chai')

const testConfig = require('../../test/client-config')
const octopusApi = require('../octopus-deploy')

describe('octopus-deploy', () => {
  beforeEach(() => {
    octopusApi.close()
  })
  afterEach(() => {
    octopusApi.close()
    octopusApi.init(testConfig)
  })

  describe('when not initialized', () => {
    it('throws an error', () => {
      expect(() => octopusApi.deployments.find('foo')).to.throw(`The configuration for the api must be set by calling 'init' before making requests`)
      expect(() => octopusApi.environments.find('foo')).to.throw(`The configuration for the api must be set by calling 'init' before making requests`)
      expect(() => octopusApi.projects.find('foo')).to.throw(`The configuration for the api must be set by calling 'init' before making requests`)
    })
  })

  describe('when already initialized', () => {
    it('throws an error', () => {
      octopusApi.init(testConfig)
      expect(() => octopusApi.init(testConfig)).to.throw('The octopus api client has already been initialized')
    })
  })
})
