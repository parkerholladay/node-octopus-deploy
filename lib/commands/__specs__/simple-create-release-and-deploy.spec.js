'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const createReleaseAndDeploy = require('../create-release-and-deploy')
const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
const mockDeployment = require('../../../test/mocks/mock-deployment')
const mockProject = require('../../../test/mocks/mock-project')
const mockVariable = require('../../../test/mocks/mock-variable')
const octopusApi = require('../../octopus-deploy')
const subject = require('../simple-create-release-and-deploy')

describe('commands/simple-create-release-and-deploy', () => {
  const projectSlug = 'my-project-name'
  const version = '1.0.0-rc-3'
  const releaseNotes = 'Release notes for testing'
  const packageVersion = '1.0.0'
  const simpleReleaseParams = { projectSlugOrId: projectSlug, version, releaseNotes, packageVersion }

  const environmentName = 'DEV-SERVER'
  const comments = 'Deploy releases-123 to DEVSERVER1'
  const variables = { SourceDir: '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
  const simpleDeployParams = { environmentName, comments, variables }

  const selectedPackages = [{ StepName: 'Step 1', Version: packageVersion }]
  const formValues = { 'd02ff723-6fdb-2011-792d-ad99eaa3e0bb': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }

  beforeEach(() => {
    sinon.stub(getProject, 'execute', () => BPromise.resolve(mockProject))
    sinon.stub(getSelectedPackages, 'execute', () => BPromise.resolve(selectedPackages))
    sinon.stub(createReleaseAndDeploy, 'execute', () => BPromise.resolve(mockDeployment))
  })

  afterEach(() => {
    sinon.restore(getProject.execute)
    sinon.restore(getSelectedPackages.execute)
    sinon.restore(octopusApi.variables.find)
    sinon.restore(createReleaseAndDeploy.execute)
  })

  describe('when environment exists', () => {
    it('should create a release and then deploy that release', () => {
      const releaseParams = { projectId: mockProject.Id, version, releaseNotes, selectedPackages }
      const deployParams = { environmentId: mockVariable.ScopeValues.Environments[0].Id, comments, formValues }

      sinon.stub(octopusApi.variables, 'find', () => mockVariable)

      return subject(simpleReleaseParams, simpleDeployParams).then(deployment => {
        expect(deployment).to.eql(mockDeployment)
        expect(getProject.execute).to.be.calledWith(projectSlug)
        expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, packageVersion)
        expect(octopusApi.variables.find).to.be.calledWith(mockProject.VariableSetId)
        expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
      })
    })
  })

  describe('when environment does not exist', () => {
    it('throws an error', () => {
      sinon.stub(octopusApi.variables, 'find', () => BPromise.resolve(mockVariable))
      const invalidParams = Object.assign({}, simpleDeployParams, { environmentName: 'wrong-env' })

      return subject(simpleReleaseParams, invalidParams).catch(err => {
        expect(err).to.be.instanceof(Error)
      })
    })
  })

  describe('when variable does not exist', () => {
    it('throws an error', () => {
      const invalidVariable = Object.assign({}, mockVariable, { Variables: [] })
      sinon.stub(octopusApi.variables, 'find', () => BPromise.resolve(invalidVariable))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.be.instanceof(Error)
      })
    })
  })

  describe('when duplicate variable exists', () => {
    it('throws an error', () => {
      const invalidVariable = Object.assign({}, mockVariable, {
        Variables: [mockVariable.Variables[0], mockVariable.Variables[0]]
      })
      sinon.stub(octopusApi.variables, 'find', () => invalidVariable)

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.be.instanceof(Error)
      })
    })
  })
})
