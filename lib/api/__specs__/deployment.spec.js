'use strict'

const subject = require('../deployment')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateDeployment } = require('../../../test/mocks')
const client = require('../../octopus-client')
const { sandbox } = require('../../../test/sandbox')

describe('api/deployment', () => {
  let deployment

  beforeEach(() => {
    deployment = generateDeployment({ id: 'tassadar-123' })
  })

  describe('#find', () => {
    beforeEach(() => {
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(deployment))
    })

    it('finds a deployment', async () => {
      const actual = await subject.find(deployment.id)
      expect(actual.value).to.deep.equal(deployment)
      expect(client.get).to.be.calledWith(`/deployments/${deployment.id}`)
    })

    describe('when deployment does not exist', () => {
      it('returns none', async () => {
        deployment = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })

  describe('#create', () => {
    const releaseId = 'zagara-123'
    const environmentId = 'warhead-junction'
    const comments = 'The swarm hungers'

    let deployParams
    let expectedParams

    beforeEach(() => {
      deployParams = { releaseId, environmentId, comments, formValues: null, machineIds: null }
      expectedParams = { releaseId, environmentId, comments }
      deployment = generateDeployment({ releaseId, environmentId, comments })

      sandbox.stub(client, 'post').callsFake(async () => Maybe.some(deployment))
    })

    describe('when optional params are not provided', () => {
      it('creates a deployment', async () => {
        const actual = await subject.create(deployParams)

        expect(actual.value).to.deep.equal(deployment)
        expect(client.post).to.be.calledWith('/deployments', expectedParams)
      })
    })

    describe('when formValues are provided', () => {
      it('creates a deployment', async () => {
        // Form Value Example: Source Directory
        // The formValues.attribute is unique id for the 'SourceDir' variable
        const formValues = { brightwing: 'I have wings. Isn\'t that happy making?' }
        deployParams = { ...deployParams, formValues }
        expectedParams = { ...expectedParams, formValues }
        deployment = { ...deployment, formValues }

        const actual = await subject.create(deployParams)

        expect(actual.value).to.deep.equal(deployment)
        expect(client.post).to.be.calledWith('/deployments', expectedParams)
      })
    })

    describe('when machineIds are provided', () => {
      it('creates a deployment', async () => {
        const machineIds = ['Probius-123', 'Probius-456']
        deployParams = { ...deployParams, machineIds }
        expectedParams = { ...expectedParams, specificMachineIds: machineIds }
        deployment = { ...deployment, specificMachineIds: machineIds }

        const actual = await subject.create(deployParams)

        expect(actual.value).to.deep.equal(deployment)
        expect(client.post).to.be.calledWith('/deployments', expectedParams)
      })
    })

    describe('when create deploy fails', () => {
      it('returns none', async () => {
        deployment = null
        const actual = await subject.create(deployParams)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
