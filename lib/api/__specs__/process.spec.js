'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const createProcess = require('../../../test/mocks/deployment-process')
const OctopusClient = require('../../octopus-client')
const Process = require('../process')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Process(client)

describe('api/process', () => {
  afterEach(() => {
    client.get.restore()
  })

  describe('#find', () => {
    it('finds a deployment process', () => {
      const process = createProcess({ id: 'collect-my-gems' })
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(process))

      return subject.find(process.id).then(actual => {
        expect(actual).to.eql(process)
        return expect(client.get).to.be.calledWith(`/deploymentProcesses/${process.id}`)
      })
    })
  })
})
