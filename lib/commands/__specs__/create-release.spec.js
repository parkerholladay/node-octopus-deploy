'use strict'

const getProject = require('../get-project')
const { createRelease, createReleaseAndDeploy } = require('../create-release')
const { generateDeployment, generateProject, generateRelease } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const paramsBuilder = require('../params-builder')
const { sandbox } = require('../../../test/sandbox')
const { logger, Maybe } = require('../../utils')

describe('commands/create-release', () => {
  const projectId = 'tyrael'
  const projectSlug = 'Tyrael'
  const releaseNotes = 'Reckoning is at hand'
  const version = '2.0'
  const selectedPackages = [{ stepName: 'Get good', version }]

  let simpleReleaseParams
  let expectedReleaseParams
  let release

  beforeEach(() => {
    simpleReleaseParams = { projectSlugOrId: projectSlug, version, releaseNotes }
    expectedReleaseParams = { projectId, version, releaseNotes, selectedPackages }
    release = generateRelease({ projectId, version, releaseNotes, selectedPackages })

    sandbox.stub(paramsBuilder, 'buildReleaseParams').callsFake(async () => Maybe.some(expectedReleaseParams))
    sandbox.stub(octopus.releases, 'create').callsFake(async () => Maybe.some(release))
    sandbox.stub(logger, 'error')
  })

  describe('#createRelease', () => {
    it('returns the created release', async () => {
      const actual = await createRelease(simpleReleaseParams)

      expect(actual.value).to.deep.equal(release)
      expect(paramsBuilder.buildReleaseParams).to.be.calledWith(simpleReleaseParams)
      expect(octopus.releases.create).to.be.calledWith(expectedReleaseParams)
    })

    describe('when build release params fails', () => {
      it('does not attempt to create release', async () => {
        expectedReleaseParams = null

        const actual = await createRelease(simpleReleaseParams)

        expect(actual.hasValue).to.be.false
        expect(octopus.releases.create).to.not.be.called
      })
    })

    describe('when create release fails', () => {
      it('returns none', async () => {
        release = null

        const actual = await createRelease(simpleReleaseParams)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.called
      })
    })
  })

  describe('#createReleaseAndDeploy', () => {
    const environmentName = 'Brasix Holdout'
    const environmentId = 'braxis-holdout'
    const comments = 'Zerg wave is approaching'
    const variableName = 'Tychus'
    const variables = { [variableName]: 'Sure thing armchair general' }
    const formValues = { [variableName.toLowerCase()]: 'Sure thing armchair general' }
    const machineIds = ['beacon-1', 'beacon-2']

    let project
    let simpleDeployParams
    let expectedDeployParams
    let deployment

    beforeEach(() => {
      project = generateProject({ id: projectId, slug: projectSlug })
      simpleDeployParams = { environmentName, comments, variables, machineIds }
      expectedDeployParams = { environmentId, comments, formValues, machineIds }
      deployment = generateDeployment({ projectId, environmentId, formValues, specificMachineIds: machineIds, comments })

      sandbox.stub(getProject, 'execute').callsFake(async () => Maybe.some(project))
      sandbox.stub(paramsBuilder, 'buildDeployParams').callsFake(async () => Maybe.some(expectedDeployParams))
      sandbox.stub(octopus.deployments, 'create').callsFake(async () => Maybe.some(deployment))
    })

    it('creates a release then deploys that release', async () => {
      const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

      expect(actual.value).to.deep.equal(deployment)
      expect(getProject.execute).to.be.calledWith(projectSlug)
      expect(paramsBuilder.buildReleaseParams).to.be.calledWith(simpleReleaseParams, project)
      expect(paramsBuilder.buildDeployParams).to.be.calledWith(simpleDeployParams, project)
      expect(octopus.releases.create).to.be.calledWith(expectedReleaseParams)
      expect(octopus.deployments.create).to.be.calledWith(release.id, expectedDeployParams)
    })

    describe('when project does not exist', () => {
      it('does not build params', async () => {
        project = null

        const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

        expect(actual.hasValue).to.be.false
        expect(getProject.execute).to.be.calledWith(projectSlug)
        expect(paramsBuilder.buildReleaseParams).to.not.be.called
        expect(paramsBuilder.buildDeployParams).to.not.be.called
      })
    })

    describe('when build release params fails', () => {
      it('does not attempt to create release', async () => {
        expectedReleaseParams = null

        const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

        expect(actual.hasValue).to.be.false
        expect(octopus.releases.create).to.not.be.called
        expect(octopus.deployments.create).to.not.be.called
      })
    })

    describe('when build deploy params fails', () => {
      it('does not attempt to create release', async () => {
        expectedDeployParams = null

        const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

        expect(actual.hasValue).to.be.false
        expect(octopus.releases.create).to.not.be.called
        expect(octopus.deployments.create).to.not.be.called
      })
    })

    describe('when create release fails', () => {
      it('does not attempt to deploy', async () => {
        release = null

        const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.called
        expect(octopus.deployments.create).to.not.be.called
      })
    })

    describe('when create deployment fails', () => {
      it('returns none', async () => {
        deployment = null

        const actual = await createReleaseAndDeploy(simpleReleaseParams, simpleDeployParams)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.called
      })
    })
  })
})
