'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')

const createReleaseAndDeploy = require('../create-release-and-deploy')
const createDeployment = require('../../../test/mocks/deployment')
const getEnvironmentId = require('../get-environment-id')
const getFormValues = require('../get-form-values')
const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
require('../../../test/init-api')
const octopus = require('../../octopus-deploy')
const createProject = require('../../../test/mocks/project')
const sandbox = require('../../../test/sandbox')
const subject = require('../simple-create-release-and-deploy')
const createVariableSet = require('../../../test/mocks/variable-set')

describe('commands/simple-create-release-and-deploy', () => {
  const project = createProject({ id: 'HotS', slug: 'heroes-of-the-storm' })
  const environment = { id: 'braxis-holdout', name: 'Braxis Holdout' }
  const variable = { name: 'Tychus', value: 'Sure thing armchair general' }
  const variableSet = createVariableSet({
    id: project.variableSetId,
    scopeValues: { environments: [environment] },
    variables: [{
      name: variable.name,
      scope: { environment: [environment.id] },
      value: ''
    }]
  })

  const version = '1.0.0-rc-3'
  const releaseNotes = 'Battle commencing in 3... 2... 1...'
  const packageVersion = '1.0.0'
  const simpleReleaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }

  const comments = 'Zerg wave is approaching'
  const deployVariables = { [variable.name]: variable.value }
  const machineIds = ['beacon-1', 'beacon-2']
  const simpleDeployParams = { environmentName: environment.name, comments, variables: deployVariables, machineIds }

  const selectedPackages = [{ stepName: 'Step 1: Pwn n00bs', version: packageVersion }]

  const variableId = variableSet.variables.filter(v => v.name === variable.name && v.scope.environment.includes(environment.id))[0].id
  const formValues = { [variableId]: deployVariables.sourceDir }

  describe('when project exists', () => {
    const deployment = createDeployment({ projectId: project.id, environmentId: environment.id, formValues, specificMachineIds: machineIds, comments })
    const deployParams = { environmentId: environment.id, comments, formValues, machineIds }

    beforeEach(() => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.resolve(variableSet))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environment.id))
      sandbox.stub(getFormValues, 'execute').callsFake(() => BPromise.resolve(formValues))
      sandbox.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.resolve(deployment))
    })

    it('creates a release and then deploy that release', () => {
      const releaseParams = { projectId: project.id, version, releaseNotes, selectedPackages }
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))

      return subject(simpleReleaseParams, simpleDeployParams).then(actual => {
        expect(actual).to.eql(deployment)
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
        expect(octopus.variables.find).to.be.calledWith(variableSet.id)
        expect(getEnvironmentId.execute).to.be.calledWith(variableSet, project.slug, environment.name)
        expect(getFormValues.execute).to.be.calledWith(deployVariables, variableSet, environment.id, environment.name)
        return expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altReleaseParams = Object.assign({}, simpleReleaseParams, { packageVersion: null })
        const altPackages = selectedPackages.map(p => Object.assign({}, p, { version }))
        sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const releaseParams = { projectId: project.id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altReleaseParams, simpleDeployParams).then(actual => {
          expect(actual).to.eql(deployment)
          expect(getProject.execute).to.be.calledWith(project.slug)
          expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
          expect(octopus.variables.find).to.be.calledWith(variableSet.id)
          expect(getEnvironmentId.execute).to.be.calledWith(variableSet, project.slug, environment.name)
          expect(getFormValues.execute).to.be.calledWith(deployVariables, variableSet, environment.id, environment.name)
          return expect(createReleaseAndDeploy.execute).to.be.calledWith(releaseParams, deployParams)
        })
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.reject('fail project'))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getSelectedPackages.execute).to.not.be.called
        expect(err).to.eql('fail project')
      })
    })
  })

  describe('when selecting packages fails', () => {
    it('does not attempt to get variables', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.reject('fail variables'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(octopus.variables.find).to.not.be.called
        expect(err).to.eql('fail packages')
      })
    })
  })

  describe('when variable set does not exist', () => {
    it('does not attempt to get environment', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.reject('fail variables'))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.reject('fail environment'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getEnvironmentId.execute).to.not.be.called
        expect(err).to.eql('fail variables')
      })
    })
  })

  describe('when environment is not found', () => {
    it('does not attempt to get form values', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.resolve(variableSet))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.reject('fail environment'))
      sandbox.stub(getFormValues, 'execute').callsFake(() => BPromise.reject('fail formValues'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(getFormValues.execute).to.not.be.called
        expect(err).to.eql('fail environment')
      })
    })
  })

  describe('when creating form values fails', () => {
    it('does not attempt to create release and deploy', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.resolve(variableSet))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environment.id))
      sandbox.stub(getFormValues, 'execute').callsFake(() => BPromise.reject('fail formValues'))
      sandbox.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.reject('fail deploy'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(createReleaseAndDeploy.execute).to.not.be.called
        expect(err).to.eql('fail formValues')
      })
    })
  })

  describe('when creating release and deploying fail', () => {
    it('rejects with an error', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.variables, 'find').callsFake(() => BPromise.resolve(variableSet))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => BPromise.resolve(environment.id))
      sandbox.stub(getFormValues, 'execute').callsFake(() => BPromise.resolve(formValues))
      sandbox.stub(createReleaseAndDeploy, 'execute').callsFake(() => BPromise.reject('fail deploy'))

      return subject(simpleReleaseParams, simpleDeployParams).catch(err => {
        expect(err).to.eql('fail deploy')
      })
    })
  })
})
