'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const Deployment = require('../deployment')
const mockDeployment = require('../../../test/mocks/mock-deployment')
const OctopusClient = require('../../octopus-client')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Deployment(client)

describe('api/deployment', () => {
  describe('#find', () => {
    afterEach(() => {
      client.get.restore()
    })

    it('finds a deployment', () => {
      const deploymentId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockDeployment))

      return subject.find(deploymentId).then(deployment => {
        expect(deployment).to.eql(mockDeployment)
        return expect(client.get).to.be.calledWith(`/deployments/${deploymentId}`)
      })
    })
  })

  describe('#create', () => {
    const releaseId = 'releases-123'
    const environmentId = 'Environments-123'
    const comments = 'Deploy releases-123 to DEVSERVER1'

    beforeEach(() => {
      sinon.stub(client, 'post').callsFake(() => BPromise.resolve(mockDeployment))
    })
    afterEach(() => {
      client.post.restore()
    })

    describe('when optional params are not provided', () => {
      it('creates a deployment', () => {
        const deployParams = {
          releaseId: releaseId,
          environmentId: environmentId,
          comments: comments
        }

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds: null }).then(deployment => {
          expect(deployment).to.eql(mockDeployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })

    describe('when formValues are provided', () => {
      it('creates a deployment', () => {
        // Form Value Example: Source Directory
        // The formValues.attribute is unique id for the 'SourceDir' variable
        const formValues = { 'd02ff723-7fdb-2011-792d-ad99eaa3e1cc': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
        const deployParams = {
          releaseId: releaseId,
          environmentId: environmentId,
          comments: comments,
          formValues: formValues
        }

        return subject.create(releaseId, { environmentId, comments, formValues, machineIds: null }).then(deployment => {
          expect(deployment).to.eql(mockDeployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })

    describe('when machineIds are provided', () => {
      it('creates a deployment', () => {
        const machineIds = ['Machines-123', 'Machines-456']
        const deployParams = {
          releaseId: releaseId,
          environmentId: environmentId,
          comments: comments,
          specificMachineIds: machineIds
        }

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds }).then(deployment => {
          expect(deployment).to.eql(mockDeployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })
  })
})
