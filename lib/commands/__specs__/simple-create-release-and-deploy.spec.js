'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const createReleaseAndDeploy = require('../create-release-and-deploy')
const getEnvironmentId = require('../get-environment-id')
const getFormValues = require('../get-form-values')
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
  const machineIds = ['Machines-123', 'Machines-456']
  const simpleDeployParams = { environmentName, comments, variables, machineIds }

  const selectedPackages = [{ StepName: 'Step 1', Version: packageVersion }]
  const environmentId = mockVariable.ScopeValues.Environments.find(env => env.Name === environmentName).Id
  const formValues = { 'd02ff723-6fdb-2011-792d-ad99eaa3e0bb': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }

  afterEach(() => {
    getProject.execute.restore()
  })

  describe('when project exists', () => {
    beforeEach(() => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environmentId))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.resolve(formValues))
      sinon.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.resolve(mockDeployment))
    })
    afterEach(() => {
      getSelectedPackages.execute.restore()
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
      createReleaseAndDeploy.execute.restore()
    })

    it('creates a release and then deploy that release', () => {
      const releaseParams = { projectId: mockProject.Id, version, releaseNotes, selectedPackages }
      const deployParams = { environmentId: mockVariable.ScopeValues.Environments[0].Id, comments, formValues, machineIds }

      return subject(simpleReleaseParams, simpleDeployParams).then(deployment => {
        expect(deployment).to.eql(mockDeployment)
        expect(getProject.execute).to.be.calledWith(projectSlug)
        expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, packageVersion)
        expect(octopusApi.variables.find).to.be.calledWith(mockProject.VariableSetId)
        expect(getEnvironmentId.execute).to.be.calledWith(mockVariable, projectSlug, environmentName)
        expect(getFormValues.execute).to.be.calledWith(variables, mockVariable, environmentId, environmentName)
        expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
      })
    })
  })

  describe('when project does not exist', () => {
    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.reject('an error'))
      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })

  describe('when selecting packages fails', () => {
    afterEach(() => {
      getSelectedPackages.execute.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('an error'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })

  describe('when variable set does not exist', () => {
    afterEach(() => {
      getSelectedPackages.execute.restore()
      octopusApi.variables.find.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.reject('an error'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })

  describe('when environment is not found', () => {
    afterEach(() => {
      getSelectedPackages.execute.restore()
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.reject('an error'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })

  describe('when creating form values fails', () => {
    afterEach(() => {
      getSelectedPackages.execute.restore()
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environmentId))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.reject('an error'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })

  describe('when creating release and deploying fails', () => {
    afterEach(() => {
      getSelectedPackages.execute.restore()
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
      createReleaseAndDeploy.execute.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environmentId))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.resolve(formValues))
      sinon.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.reject('an error'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })
})
