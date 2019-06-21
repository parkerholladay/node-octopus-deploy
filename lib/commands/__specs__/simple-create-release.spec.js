'use strict'

const BPromise = require('bluebird')

const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
require('../../../test/init-api')
const { generateProject, generateRelease } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')
const { execute: subject } = require('../simple-create-release')

describe('commands/simple-create-release', () => {
  const project = generateProject({ id: 'tyrael' })

  const version = '2.0'
  const releaseNotes = 'Reckoning is at hand'
  const packageVersion = '2.0-beta'
  const releaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }

  const selectedPackages = [{ stepName: 'Step 1: Get good', version: packageVersion }]
  const release = generateRelease({
    projectId: project.id,
    deploymentProcessId: project.deploymentProcessId,
    releaseNotes,
    version
  })

  describe('when project exists', () => {
    beforeEach(() => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.resolve(release))
    })

    it('creates a release', () => {
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))

      const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages }
      return subject(releaseParams).then(actual => {
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
        expect(octopus.releases.create).to.be.calledWith(expectedParams)
        return expect(actual).to.deep.equal(release)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altParams = Object.assign({}, releaseParams, { packageVersion: null })
        const altPackages = selectedPackages.map(p => Object.assign({}, p, { version }))
        sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altParams).then(actual => {
          expect(getProject.execute).to.be.calledWith(project.slug)
          expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
          expect(octopus.releases.create).to.be.calledWith(expectedParams)
          return expect(actual).to.deep.equal(release)
        })
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.reject('fail project'))
      sandbox.stub(getSelectedPackages, 'execute')

      return subject(releaseParams).catch(err => {
        expect(getSelectedPackages.execute).to.not.be.called
        return expect(err).to.equal('fail project')
      })
    })
  })

  describe('when selecting packages fails', () => {
    it('does not attempt to create release', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sandbox.stub(octopus.releases, 'create')

      return subject(releaseParams).catch(err => {
        expect(octopus.releases.create).to.not.be.called
        return expect(err).to.equal('fail packages')
      })
    })
  })

  describe('when creating release fails', () => {
    it('rejects with an error', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.reject('fail release'))

      return expect(subject(releaseParams)).to.eventually.be.rejectedWith('fail release')
    })
  })
})
