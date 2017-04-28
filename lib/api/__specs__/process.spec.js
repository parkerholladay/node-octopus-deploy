'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const mockProcess = require('../../../test/mocks/mock-deployment-process')
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
      const deploymentProcessId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockProcess))

      return subject.find(deploymentProcessId).then(process => {
        expect(process).to.eql(mockProcess)
        expect(client.get).to.be.calledWith(`/deploymentProcesses/${deploymentProcessId}`)
      })
    })
  })
})
