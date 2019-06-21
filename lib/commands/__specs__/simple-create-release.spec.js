'use strict'

const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateProject, generateRelease } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')
const { execute: subject } = require('../simple-create-release')

describe('commands/simple-create-release', () => {
  const version = '2.0'
  const releaseNotes = 'Reckoning is at hand'
  const packageVersion = '2.0-beta'
  let selectedPackages

  let project
  let releaseParams
  let release

  beforeEach(() => {
    project = generateProject({ id: 'tyrael' })
    selectedPackages = [{ stepName: 'Step 1: Get good', version: packageVersion }]

    releaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }

    release = generateRelease({
      projectId: project.id,
      deploymentProcessId: project.deploymentProcessId,
      releaseNotes,
      version
    })

    sandbox.stub(getProject, 'execute').callsFake(async () => Maybe.some(project))
    sandbox.stub(getSelectedPackages, 'execute').callsFake(async () => selectedPackages)
    sandbox.stub(octopus.releases, 'create').callsFake(async () => Maybe.some(release))
  })

  describe('when project exists', () => {
    it('creates a release', async () => {
      const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages }

      const actual = await subject(releaseParams)

      expect(actual).to.deep.equal(Maybe.some(release))
      expect(getProject.execute).to.be.calledWith(project.slug)
      expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
      expect(octopus.releases.create).to.be.calledWith(expectedParams)
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', async () => {
        releaseParams = { ...releaseParams, packageVersion: null }
        selectedPackages = selectedPackages.map(p => ({ ...p, version }))

        const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages }

        const actual = await subject(releaseParams)

        expect(actual).to.deep.equal(Maybe.some(release))
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
        expect(octopus.releases.create).to.be.calledWith(expectedParams)
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', async () => {
      project = null

      const actual = await subject(await releaseParams)

      expect(actual.hasValue).to.be.false
      expect(getSelectedPackages.execute).to.not.be.called
    })
  })

  describe('when selecting packages is empty', () => {
    it('does not attempt to create release', async () => {
      selectedPackages = []

      const actual = await subject(releaseParams)

      expect(actual.hasValue).to.be.false
      expect(octopus.releases.create).to.not.be.called
    })
  })

  describe('when creating release fails', () => {
    it('rejects with an error', async () => {
      release = null
      const actual = await subject(releaseParams)
      expect(actual.hasValue).to.be.false
    })
  })
})
