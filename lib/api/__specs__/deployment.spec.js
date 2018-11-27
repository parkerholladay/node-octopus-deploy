'use strict'

const BPromise = require('bluebird')

const Deployment = require('../deployment')
const createDeployment = require('../../../test/mocks/deployment')
const OctopusClient = require('../../utils/octopus-client')
const sandbox = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Deployment(client)

describe('api/deployment', () => {
  describe('#find', () => {
    it('finds a deployment', () => {
      const deployment = createDeployment({ id: 'tassadar-123' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(deployment))

      return subject.find(deployment.id).then(actual => {
        expect(client.get).to.be.calledWith(`/deployments/${deployment.id}`)
        return expect(actual).to.deep.equal(deployment)
      })
    })
  })

  describe('#create', () => {
    const releaseId = 'zagara-123'
    const environmentId = 'warhead-junction'
    const comments = 'The swarm hungers'

    describe('when optional params are not provided', () => {
      it('creates a deployment', () => {
        const deployParams = { releaseId, environmentId, comments }
        const deployment = createDeployment({ releaseId, environmentId, comments })
        sandbox.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds: null }).then(actual => {
          expect(client.post).to.be.calledWith('/deployments', deployParams)
          return expect(actual).to.deep.equal(deployment)
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
        sandbox.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues, machineIds: null }).then(actual => {
          expect(client.post).to.be.calledWith('/deployments', deployParams)
          return expect(actual).to.deep.equal(deployment)
        })
      })
    })

    describe('when machineIds are provided', () => {
      it('creates a deployment', () => {
        const machineIds = ['Probius-123', 'Probius-456']
        const deployParams = { releaseId, environmentId, comments, specificMachineIds: machineIds }
        const deployment = createDeployment({ releaseId, environmentId, comments, specificMachineIds: machineIds })
        sandbox.stub(client, 'post').callsFake(() => BPromise.resolve(deployment))

        return subject.create(releaseId, { environmentId, comments, formValues: null, machineIds }).then(actual => {
          expect(client.post).to.be.calledWith('/deployments', deployParams)
          return expect(actual).to.deep.equal(deployment)
        })
      })
    })
  })
})
