'use strict'

const BPromise = require('bluebird')

const Environment = require('../environment')
const { generateEnvironment } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Environment(client)

describe('api/environment', () => {
  describe('#find', () => {
    it('finds an environment', () => {
      const environment = generateEnvironment({ id: 'infernal-shrines' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(environment))

      return subject.find(environment.id).then(actual => {
        expect(client.get).to.be.calledWith(`/environments/${environment.id}`)
        return expect(actual).to.deep.equal(environment)
      })
    })
  })

  describe('#findAll', () => {
    it('finds all environments', () => {
      const environments = [
        generateEnvironment({ id: 'haunted-mines' }),
        generateEnvironment({ id: 'towers-of-doom' }),
        generateEnvironment({ id: 'cursed-hollow' })
      ]
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve([environments]))

      return subject.findAll().then(actual => {
        expect(client.get).to.be.calledWith(`/environments/all`)
        return expect(actual).to.deep.equal([environments])
      })
    })
  })
})
