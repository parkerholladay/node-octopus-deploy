'use strict'

const createReleaseAndDeploy = require('../create-release-and-deploy')
const getEnvironmentId = require('../get-environment-id')
const getFormValues = require('../get-form-values')
const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateDeployment, generateProject, generateVariableSet } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')
const { execute: subject } = require('../simple-create-release-and-deploy')

describe('commands/simple-create-release-and-deploy', () => {
  const variable = { name: 'Tychus', value: 'Sure thing armchair general' }
  const version = '1.0.0-rc-3'
  const releaseNotes = 'Battle commencing in 3... 2... 1...'
  const packageVersion = '1.0.0'

  const comments = 'Zerg wave is approaching'
  const deployVariables = { [variable.name]: variable.value }
  const machineIds = ['beacon-1', 'beacon-2']

  let project
  let selectedPackages
  let environmentId
  let environment
  let variableSet
  let formValues
  let simpleReleaseParams
  let simpleDeployParams
  let deployment
  let expectedReleaseParams
  let expectedDeployParams

  beforeEach(() => {
    project = generateProject({ id: 'HotS', slug: 'heroes-of-the-storm' })
    selectedPackages = [{ stepName: 'Step 1: Pwn n00bs', version: packageVersion }]
    environmentId = 'braxis-holdout'
    environment = { id: environmentId, name: 'Braxis Holdout' }
    variableSet = generateVariableSet({
      id: project.variableSetId,
      scopeValues: { environments: [environment] },
      variables: [{
        name: variable.name,
        scope: { environment: [environment.id] },
        value: ''
      }]
    })

    const variableId = variableSet.variables.filter(v => v.name === variable.name && v.scope.environment.includes(environment.id))[0].id
    formValues = { [variableId]: deployVariables.sourceDir }

    simpleReleaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }
    simpleDeployParams = { environmentName: environment.name, comments, variables: deployVariables, machineIds }

    deployment = generateDeployment({ projectId: project.id, environmentId, formValues, specificMachineIds: machineIds, comments })

    expectedReleaseParams = { projectId: project.id, version, releaseNotes, selectedPackages }
    expectedDeployParams = { environmentId, comments, formValues, machineIds }

    sandbox.stub(getProject, 'execute').callsFake(async () => Maybe.some(project))
    sandbox.stub(getSelectedPackages, 'execute').callsFake(async () => selectedPackages)
    sandbox.stub(octopus.variables, 'find').callsFake(async () => Maybe.some(variableSet))
    sandbox.stub(getEnvironmentId, 'execute').callsFake(() => Maybe.some(environmentId))
    sandbox.stub(getFormValues, 'execute').callsFake(() => Maybe.some(formValues))
    sandbox.stub(createReleaseAndDeploy, 'execute').callsFake(async () => Maybe.some(deployment))
  })

  describe('when project exists', () => {
    it('creates a release and then deploy that release', async () => {
      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual).to.deep.equal(Maybe.some(deployment))
      expect(getProject.execute).to.be.calledWith(project.slug)
      expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
      expect(octopus.variables.find).to.be.calledWith(variableSet.id)
      expect(getEnvironmentId.execute).to.be.calledWith(variableSet, project.slug, environment.name)
      expect(getFormValues.execute).to.be.calledWith(deployVariables, variableSet, environment.id, environment.name)
      expect(createReleaseAndDeploy.execute).to.be.calledWith(expectedReleaseParams, expectedDeployParams)
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', async () => {
        simpleReleaseParams = { ...simpleReleaseParams, packageVersion: null }
        selectedPackages = selectedPackages.map(p => ({ ...p, version }))
        expectedReleaseParams = { ...expectedReleaseParams, selectedPackages }

        const actual = await subject(simpleReleaseParams, simpleDeployParams)

        expect(actual).to.deep.equal(Maybe.some(deployment))
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
        expect(octopus.variables.find).to.be.calledWith(variableSet.id)
        expect(getEnvironmentId.execute).to.be.calledWith(variableSet, project.slug, environment.name)
        expect(getFormValues.execute).to.be.calledWith(deployVariables, variableSet, environment.id, environment.name)
        expect(createReleaseAndDeploy.execute).to.be.calledWith(expectedReleaseParams, expectedDeployParams)
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', async () => {
      project = null

      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual.hasValue).to.be.false
      expect(getSelectedPackages.execute).to.not.be.called
    })
  })

  describe('when selecting packages fails', () => {
    it('does not attempt to get variables', async () => {
      selectedPackages = []

      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual.hasValue).to.be.false
      expect(octopus.variables.find).to.not.be.called
    })
  })

  describe('when variable set does not exist', () => {
    it('does not attempt to get environment', async () => {
      variableSet = null

      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual.hasValue).to.be.false
      expect(getEnvironmentId.execute).to.not.be.called
    })
  })

  describe('when environment is not found', () => {
    it('does not attempt to get form values', async () => {
      environmentId = null

      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual.hasValue).to.be.false
      expect(getFormValues.execute).to.not.be.called
    })
  })

  describe('when creating form values fails', () => {
    it('does not attempt to create release and deploy', async () => {
      formValues = null

      const actual = await subject(simpleReleaseParams, simpleDeployParams)

      expect(actual.hasValue).to.be.false
      expect(createReleaseAndDeploy.execute).to.not.be.called
    })
  })

  describe('when creating release and deploying fail', () => {
    it('returns none', async () => {
      deployment = null
      const actual = await subject(simpleReleaseParams, simpleDeployParams)
      expect(actual.hasValue).to.be.false
    })
  })
})
