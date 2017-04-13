'use strict'

const { expect } = require('chai')

const testConfig = require('../../test/client-config')
const subject = require('../octopus-deploy')

describe('octopus-deploy', () => {
  beforeEach(() => {
    subject.close()
  })
  afterEach(() => {
    subject.close()
    subject.init(testConfig)
  })

  describe('#init', () => {
    it('throws an error when already initialized', () => {
      subject.init(testConfig)
      expect(() => subject.init(testConfig)).to.throw('The octopus api client has already been initialized')
    })
  })

  describe('#get *', () => {
    it('throws an error when not initialized', () => {
      expect(() => subject.deployments).to.throw(`The configuration for the api must be set by calling 'init' before making requests`)
    })
  })
})
