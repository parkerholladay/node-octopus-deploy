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
    getSelectedPackages.execute.restore()
  })

  describe('when project exists', () => {
    const deployParams = { environmentId: mockVariable.ScopeValues.Environments[0].Id, comments, formValues, machineIds }

    beforeEach(() => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environmentId))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.resolve(formValues))
      sinon.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.resolve(mockDeployment))
    })
    afterEach(() => {
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
      createReleaseAndDeploy.execute.restore()
    })

    it('creates a release and then deploy that release', () => {
      const releaseParams = { projectId: mockProject.Id, version, releaseNotes, selectedPackages }
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))

      return subject(simpleReleaseParams, simpleDeployParams).then(deployment => {
        expect(deployment).to.eql(mockDeployment)
        expect(getProject.execute).to.be.calledWith(projectSlug)
        expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, packageVersion)
        expect(octopusApi.variables.find).to.be.calledWith(mockProject.VariableSetId)
        expect(getEnvironmentId.execute).to.be.calledWith(mockVariable, projectSlug, environmentName)
        expect(getFormValues.execute).to.be.calledWith(variables, mockVariable, environmentId, environmentName)
        return expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altReleaseParams = Object.assign({}, simpleReleaseParams, { packageVersion: null })
        const altPackages = [Object.assign({}, selectedPackages[0], { Version: version })]
        sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const releaseParams = { projectId: mockProject.Id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altReleaseParams, simpleDeployParams).then(deploy => {
          expect(deploy).to.eql(mockDeployment)
          expect(getProject.execute).to.be.calledWith(projectSlug)
          expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, version)
          expect(octopusApi.variables.find).to.be.calledWith(mockProject.VariableSetId)
          expect(getEnvironmentId.execute).to.be.calledWith(mockVariable, projectSlug, environmentName)
          expect(getFormValues.execute).to.be.calledWith(variables, mockVariable, environmentId, environmentName)
          return expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
        })
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.reject('fail project'))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getSelectedPackages.execute).to.not.be.called
        expect(err).to.eql('fail project')
      })
    })
  })

  describe('when selecting packages fails', () => {
    afterEach(() => {
      octopusApi.variables.find.restore()
    })

    it('does not attempt to get variables', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.reject('fail variables'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(octopusApi.variables.find).to.not.be.called
        expect(err).to.eql('fail packages')
      })
    })
  })

  describe('when variable set does not exist', () => {
    afterEach(() => {
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
    })

    it('does not attempt to get environment', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.reject('fail variables'))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.reject('fail environment'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getEnvironmentId.execute).to.not.be.called
        expect(err).to.eql('fail variables')
      })
    })
  })

  describe('when environment is not found', () => {
    afterEach(() => {
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
    })

    it('does not attempt to get form values', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.reject('fail environment'))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.reject('fail formValues'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getFormValues.execute).to.not.be.called
        expect(err).to.eql('fail environment')
      })
    })
  })

  describe('when creating form values fails', () => {
    afterEach(() => {
      octopusApi.variables.find.restore()
      getEnvironmentId.execute.restore()
      getFormValues.execute.restore()
      createReleaseAndDeploy.execute.restore()
    })

    it('does not attempt to create release and deploy', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.variables, 'find').callsFake(() => BPromise.resolve(mockVariable))
      sinon.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environmentId))
      sinon.stub(getFormValues, 'execute').callsFake(() => BPromise.reject('fail formValues'))
      sinon.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.reject('fail deploy'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(createReleaseAndDeploy.execute).to.not.be.called
        expect(err).to.eql('fail formValues')
      })
    })
  })

  describe('when creating release and deploying fail', () => {
    afterEach(() => {
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
      sinon.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.reject('fail deploy'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('fail deploy')
      })
    })
  })
})
