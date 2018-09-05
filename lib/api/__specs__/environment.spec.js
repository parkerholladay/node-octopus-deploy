'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')

const Environment = require('../environment')
const createEnvironment = require('../../../test/mocks/environment')
const OctopusClient = require('../../utils/octopus-client')
const sandbox = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Environment(client)

describe('api/environment', () => {
  describe('#find', () => {
    it('finds an environment', () => {
      const environment = createEnvironment({ id: 'infernal-shrines' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(environment))

      return subject.find(environment.id).then(actual => {
        expect(actual).to.eql(environment)
        return expect(client.get).to.be.calledWith(`/environments/${environment.id}`)
      })
    })
  })

  describe('#findAll', () => {
    it('finds all environments', () => {
      const environments = [
        createEnvironment({ id: 'haunted-mines' }),
        createEnvironment({ id: 'towers-of-doom' }),
        createEnvironment({ id: 'cursed-hollow' })
      ]
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve([environments]))

      return subject.findAll().then(actual => {
        expect(actual).to.eql([environments])
        return expect(client.get).to.be.calledWith(`/environments/all`)
      })
    })
  })
})
