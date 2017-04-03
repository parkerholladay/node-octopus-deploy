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
  afterEach(() => {
    sinon.restore(client.get)
    sinon.restore(client.post)
  })

  describe('#find', () => {
    it('finds a deployment', () => {
      const deploymentId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get', () => BPromise.resolve(mockDeployment))

      return subject.find(deploymentId).then(deployment => {
        expect(deployment).to.eql(mockDeployment)
        expect(client.get).to.be.calledWith(`/deployments/${deploymentId}`)
      })
    })
  })

  describe('#create', () => {
    const environmentId = 'Environments-123'
    const releaseId = 'releases-123'
    const comments = 'Deploy releases-123 to DEVSERVER1'

    beforeEach(() => {
      sinon.stub(client, 'post', () => BPromise.resolve(mockDeployment))
    })

    describe('when formValues are provided', () => {
      it('creates a deployment', () => {
        // Form Value Example: Source Directory
        // The formValues.attribute is unique id for the 'SourceDir' variable
        const formValues = { 'd02ff723-7fdb-2011-792d-ad99eaa3e1cc': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
        const createParams = {
          EnvironmentId: environmentId,
          ReleaseId: releaseId,
          Comments: comments,
          FormValues: formValues
        }

        return subject.create(environmentId, releaseId, comments, formValues).then(deployment => {
          expect(deployment).to.eql(mockDeployment)
          expect(client.post).to.be.calledWith('/deployments', createParams)
        })
      })
    })

    describe('when formValues are not provided', () => {
      it('creates a deployment', () => {
        const createParams = {
          EnvironmentId: environmentId,
          ReleaseId: releaseId,
          Comments: comments
        }

        return subject.create(environmentId, releaseId, comments, null).then(deployment => {
          expect(deployment).to.eql(mockDeployment)
          expect(client.post).to.be.calledWith('/deployments', createParams)
        })
      })
    })
  })
})
