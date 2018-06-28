'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const octo = require('../../')
const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
const createProject = require('../../../test/mocks/project')
const createRelease = require('../../../test/mocks/release')
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

  afterEach(() => {
    getProject.execute.restore()
    getSelectedPackages.execute.restore()
  })

  describe('when project exists', () => {
    beforeEach(() => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sinon.stub(octo.api.releases, 'create').callsFake(() => BPromise.resolve(release))
    })
    afterEach(() => {
      octo.api.releases.create.restore()
    })

    it('creates a release', () => {
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))

      const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages }
      return subject(releaseParams).then(actual => {
        expect(actual).to.eql(release)
        expect(getProject.execute).to.be.calledWith(project.slug)
        expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, packageVersion)
        return expect(octo.api.releases.create).to.be.calledWith(expectedParams)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altParams = Object.assign({}, releaseParams, { packageVersion: null })
        const altPackages = selectedPackages.map(p => Object.assign({}, p, { version: version }))
        sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const expectedParams = { projectId: project.id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altParams).then(actual => {
          expect(actual).to.eql(release)
          expect(getProject.execute).to.be.calledWith(project.slug)
          expect(getSelectedPackages.execute).to.be.calledWith(project.deploymentProcessId, version)
          return expect(octo.api.releases.create).to.be.calledWith(expectedParams)
        })
      })
    })
  })

  describe('when project does not exist', () => {
    it('does not attempt to get selected packages', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.reject('fail project'))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))

      return subject(releaseParams).catch(err => {
        expect(getSelectedPackages.execute).to.not.be.called
        expect(err).to.eql('fail project')
      })
    })
  })

  describe('when selecting packages fails', () => {
    afterEach(() => {
      octo.api.releases.create.restore()
    })

    it('does not attempt to create release', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sinon.stub(octo.api.releases, 'create').callsFake(() => BPromise.reject('fail release'))

      return subject(releaseParams).catch(err => {
        expect(octo.api.releases.create).to.not.be.called
        expect(err).to.eql('fail packages')
      })
    })
  })

  describe('when creating release fails', () => {
    afterEach(() => {
      octo.api.releases.create.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(project))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octo.api.releases, 'create').callsFake(() => BPromise.reject('an error'))

      return subject(releaseParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })
})
