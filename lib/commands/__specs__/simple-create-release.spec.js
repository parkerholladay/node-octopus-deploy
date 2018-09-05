'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')

const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
require('../../../test/init-api')
const octopus = require('../../octopus-deploy')
const createProject = require('../../../test/mocks/project')
const createRelease = require('../../../test/mocks/release')
const sandbox = require('../../../test/sandbox')
const subject = require('../simple-create-release')

describe('commands/simple-create-release', () => {
  const project = createProject({ id: 'tyrael' })

  const version = '2.0'
  const releaseNotes = 'Reckoning is at hand'
  const packageVersion = '2.0-beta'
  const releaseParams = { projectSlugOrId: project.slug, version, releaseNotes, packageVersion }

  const selectedPackages = [{ stepName: 'Step 1: Get good', version: packageVersion }]
  const release = createRelease({
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
        expect(actual).to.eql(release)
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
        return expect(octopus.releases.create).to.be.calledWith(expectedParams)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altParams = Object.assign({}, releaseParams, { packageVersion: null })
        const altPackages = selectedPackages.map(p => Object.assign({}, p, { version }))
        sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altParams).then(actual => {
          expect(actual).to.eql(release)
          expect(getProject.execute).to.be.calledWith(project.slug)
          expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
          return expect(octopus.releases.create).to.be.calledWith(expectedParams)
        })
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.reject('fail project'))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))

      return subject(releaseParams).catch(err => {
        expect(getSelectedPackages.execute).to.not.be.called
        expect(err).to.eql('fail project')
      })
    })
  })

  describe('when selecting packages fails', () => {
    it('does not attempt to create release', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.reject('fail release'))

      return subject(releaseParams).catch(err => {
        expect(octopus.releases.create).to.not.be.called
        expect(err).to.eql('fail packages')
      })
    })
  })

  describe('when creating release fails', () => {
    it('rejects with an error', () => {
      sandbox.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sandbox.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.reject('an error'))

      return subject(releaseParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })
})
