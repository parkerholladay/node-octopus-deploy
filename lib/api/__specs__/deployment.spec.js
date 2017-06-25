'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const Deployment = require('../deployment')
const createDeployment = require('../../../test/mocks/deployment')
const OctopusClient = require('../../octopus-client')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Deployment(client)

describe('api/deployment', () => {
  describe('#find', () => {
    afterEach(() => {
      client.get.restore()
    })

    it('finds a deployment', () => {
      const deployment = createDeployment({ id: 'tassadar-123' })
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(deployment))

      return subject.find(deployment.id).then(actual => {
        expect(actual).to.eql(deployment)
        return expect(client.get).to.be.calledWith(`/deployments/${deployment.id}`)
      })
    })
  })

  describe('#create', () => {
    const releaseId = 'zagara-123'
    const environmentId = 'warhead-junction'
    const comments = 'The swarm hungers'

    afterEach(() => {
      client.post.restore()
    })

    describe('when optional params are not provided', () => {
      it('creates a deployment', () => {
        const deployParams = { releaseId, environmentId, comments }
        const deployment = createDeployment({ releaseId, environmentId, comments })
        sinon.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds: null }).then(actual => {
          expect(actual).to.eql(deployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })

    describe('when formValues are provided', () => {
      it('creates a deployment', () => {
        // Form Value Example: Source Directory
        // The formValues.attribute is unique id for the 'SourceDir' variable
        const formValues = { brightwing: `I have wings. Isn't that happy making?` }
        const deployParams = { releaseId, environmentId, comments, formValues }
        const deployment = createDeployment({ releaseId, environmentId, comments, formValues })
        sinon.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues, machineIds: null }).then(actual => {
          expect(actual).to.eql(deployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })

    describe('when machineIds are provided', () => {
      it('creates a deployment', () => {
        const machineIds = ['Probius-123', 'Probius-456']
        const deployParams = { releaseId, environmentId, comments, specificMachineIds: machineIds }
        const deployment = createDeployment({ releaseId, environmentId, comments, specificMachineIds: machineIds })
        sinon.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds }).then(actual => {
          expect(actual).to.eql(deployment)
          return expect(client.post).to.be.calledWith('/deployments', deployParams)
        })
      })
    })
  })
})
