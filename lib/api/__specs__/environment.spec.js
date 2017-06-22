'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const Environment = require('../environment')
const mockEnvironment = require('../../../test/mocks/mock-environment')
const OctopusClient = require('../../octopus-client')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Environment(client)

describe('api/environment', () => {
  afterEach(() => {
    client.get.restore()
  })

  describe('#find', () => {
    it('finds an environment', () => {
      const environmentId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockEnvironment))

      return subject.find(environmentId).then(environment => {
        expect(environment).to.eql(mockEnvironment)
        return expect(client.get).to.be.calledWith(`/environments/${environmentId}`)
      })
    })
  })

  describe('#findAll', () => {
    it('finds all environments', () => {
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve([mockEnvironment, mockEnvironment, mockEnvironment]))

      return subject.findAll().then(environments => {
        expect(environments).to.eql([mockEnvironment, mockEnvironment, mockEnvironment])
        return expect(client.get).to.be.calledWith(`/environments/all`)
      })
    })
  })
})
