'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../create-release-and-deploy').execute
const mockDeployment = require('../../../test/mocks/mock-deployment')
const mockRelease = require('../../../test/mocks/mock-release')
const octopusApi = require('../../octopus-deploy')

describe('commands/create-release-and-deploy', () => {
  afterEach(() => {
    octopusApi.releases.create.restore()
    octopusApi.deployments.create.restore()
  })

  it('creates a release and then deploys that release', () => {
    const projectId = 'project-123'
    const version = '1.0.0-rc-3'
    const releaseNotes = 'Release notes for testing'
    const selectedPackages = [{ 'StepName': 'Step 1', 'Version': '1.0.0' }]
    const releaseParams = { projectId, version, releaseNotes, selectedPackages }

    const environmentId = 'Environments-123'
    const comments = 'Deploy releases-123 to DEVSERVER1'
    const formValues = { 'd02ff723-6fdb-2011-792d-ad99eaa3e0bb': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
    const machineIds = ['Machines-123', 'Machines-456']
    const deployParams = { environmentId, comments, formValues, machineIds }

    sinon.stub(octopusApi.releases, 'create').callsFake(() => BPromise.resolve(mockRelease))
    sinon.stub(octopusApi.deployments, 'create').callsFake(() => BPromise.resolve(mockDeployment))

    return subject(releaseParams, deployParams).then(deployment => {
      expect(deployment).to.eql(mockDeployment)
      expect(octopusApi.releases.create).to.be.calledWith(releaseParams)
      return expect(octopusApi.deployments.create).to.be.calledWith(mockRelease.Id, deployParams)
    })
  })
})
