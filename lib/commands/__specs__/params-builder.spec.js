'use strict'

const getEnvironmentId = require('../get-environment-id')
const getFormValues = require('../get-form-values')
const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
const getVariableSet = require('../get-variable-set')
require('../../../test/init-api')
const { generateEnvironment, generateProject, generateVariableSet } = require('../../../test/mocks')
const { buildDeployParams, buildReleaseParams } = require('../params-builder')
const { sandbox } = require('../../../test/sandbox')
const { Maybe } = require('../../utils')

describe('commands/params-builder', () => {
  const projectId = 'tyrael'
  const releaseNotes = 'Reckoning is at hand'

  let project

  beforeEach(() => {
    project = generateProject({ id: projectId })
  })

  describe('#buildReleaseParams', () => {
    const version = '2.0'
    const packageVersion = '2.0-beta'

    let selectedPackages
    let simpleReleaseParams
    let expectedReleaseParams

    beforeEach(() => {
      selectedPackages = [{ stepName: 'Step 1: Get good', version: packageVersion }]

      simpleReleaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }
      expectedReleaseParams = { projectId, version, releaseNotes, selectedPackages }

      sandbox.stub(getProject, 'execute').callsFake(async () => Maybe.some(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(async () => selectedPackages)
    })

    it('returns release params', async () => {
      const actual = await buildReleaseParams(simpleReleaseParams)

      expect(actual.value).to.deep.equal(expectedReleaseParams)
      expect(getProject.execute).to.be.calledWith(project.slug)
      expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
    })

    describe('when optional project is provided', () => {
      it('does not get project again', async () => {
        const actual = await buildReleaseParams(simpleReleaseParams, project)

        expect(actual.value).to.deep.equal(expectedReleaseParams)
        expect(getProject.execute).to.not.be.called
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', async () => {
        simpleReleaseParams = { ...simpleReleaseParams, packageVersion: null }
        selectedPackages = selectedPackages.map(p => ({ ...p, version }))
        expectedReleaseParams = { ...expectedReleaseParams, selectedPackages }

        const actual = await buildReleaseParams(simpleReleaseParams)

        expect(actual.value).to.deep.equal(expectedReleaseParams)
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
      })
    })

    describe('when project does not exist', () => {
      it('does not attempt to get selected packages', async () => {
        project = null

        const actual = await buildReleaseParams(simpleReleaseParams)

        expect(actual.hasValue).to.be.false
        expect(getSelectedPackages.execute).to.not.be.called
      })
    })

    describe('when selected packages is empty', () => {
      it('returns none', async () => {
        selectedPackages = []
        const actual = await buildReleaseParams(simpleReleaseParams)
        expect(actual.hasValue).to.be.false
      })
    })
  })

  describe('#buildDeployParams', () => {
    const comments = 'Zerg wave is approaching'
    const variableName = 'Tychus'
    const variables = { [variableName]: 'Sure thing armchair general' }
    const machineIds = ['beacon-1', 'beacon-2']

    let variableSet
    let environmentId
    let environmentName
    let formValues
    let simpleDeployParams
    let expectedDeployParams

    beforeEach(() => {
      environmentId = 'braxis-holdout'
      environmentName = 'Braxis Holdout'
      const environment = generateEnvironment({ id: environmentId, name: environmentName })

      variableSet = generateVariableSet({
        id: project.variableSetId,
        scopeValues: { environments: [environment] },
        variables: [{
          id: variableName.toLowerCase(),
          name: variableName,
          scope: { environment: [environment.id] },
          value: ''
        }]
      })
      formValues = { [variableName.toLowerCase()]: 'Sure thing armchair general' }

      simpleDeployParams = { environmentName, comments, variables: variables, machineIds }
      expectedDeployParams = { environmentId, comments, formValues, machineIds }

      sandbox.stub(getVariableSet, 'execute').callsFake(async () => Maybe.some(variableSet))
      sandbox.stub(getEnvironmentId, 'execute').callsFake(() => Maybe.some(environmentId))
      sandbox.stub(getFormValues, 'execute').callsFake(() => Maybe.some(formValues))
    })

    it('returns deploy params', async () => {
      const actual = await buildDeployParams(simpleDeployParams, project)

      expect(actual.value).to.deep.equal(expectedDeployParams)
      expect(getVariableSet.execute).to.be.calledWith(variableSet.id)
      expect(getEnvironmentId.execute).to.be.calledWith(variableSet, projectId, environmentName)
      expect(getFormValues.execute).to.be.calledWith(variables, variableSet, environmentId, environmentName)
    })

    describe('when variable set does not exist', () => {
      it('does not attempt to get environment', async () => {
        variableSet = null

        const actual = await buildDeployParams(simpleDeployParams, project)

        expect(actual.hasValue).to.be.false
        expect(getEnvironmentId.execute).to.not.be.called
      })
    })

    describe('when environment is not found', () => {
      it('does not attempt to get form values', async () => {
        environmentId = null

        const actual = await buildDeployParams(simpleDeployParams, project)

        expect(actual.hasValue).to.be.false
        expect(getFormValues.execute).to.not.be.called
      })
    })

    describe('when creating form values fails', () => {
      it('return none', async () => {
        formValues = null
        const actual = await buildDeployParams(simpleDeployParams, project)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
