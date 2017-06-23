'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const getProject = require('../get-project')
const getSelectedPackages = require('../get-selected-packages')
const mockProject = require('../../../test/mocks/mock-project')
const mockRelease = require('../../../test/mocks/mock-release')
const octopusApi = require('../../octopus-deploy')
const subject = require('../simple-create-release')

describe('commands/simple-create-release', () => {
  const projectSlug = 'my-project-name'
  const version = '1.0.0-rc-3'
  const releaseNotes = 'Release notes for testing'
  const packageVersion = '1.0.0'
  const releaseParams = { projectSlugOrId: projectSlug, version, releaseNotes, packageVersion }

  const selectedPackages = [{ StepName: 'Step 1', Version: packageVersion }]

  afterEach(() => {
    getProject.execute.restore()
    getSelectedPackages.execute.restore()
  })

  describe('when project exists', () => {
    beforeEach(() => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(octopusApi.releases, 'create').callsFake(() => BPromise.resolve(mockRelease))
    })
    afterEach(() => {
      octopusApi.releases.create.restore()
    })

    it('creates a release', () => {
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))

      const expected = { projectId: mockProject.Id, version, releaseNotes, selectedPackages }
      return subject(releaseParams).then(release => {
        expect(release).to.eql(mockRelease)
        expect(getProject.execute).to.be.calledWith(projectSlug)
        expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, packageVersion)
        return expect(octopusApi.releases.create).to.be.calledWith(expected)
      })
    })

    describe('when packageVersion is not provided', () => {
      it('uses version as packageVersion', () => {
        const altParams = Object.assign({}, releaseParams, { packageVersion: null })
        const altPackages = [Object.assign({}, selectedPackages[0], { Version: version })]
        sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(altPackages))

        const expected = { projectId: mockProject.Id, version, releaseNotes, selectedPackages: altPackages }
        return subject(altParams).then(release => {
          expect(release).to.eql(mockRelease)
          expect(getProject.execute).to.be.calledWith(projectSlug)
          expect(getSelectedPackages.execute).to.be.calledWith(mockProject.DeploymentProcessId, version)
          return expect(octopusApi.releases.create).to.be.calledWith(expected)
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
      octopusApi.releases.create.restore()
    })

    it('does not attempt to create release', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.reject('fail packages'))
      sinon.stub(octopusApi.releases, 'create').callsFake(() => BPromise.reject('fail release'))

      return subject(releaseParams).catch(err => {
        expect(octopusApi.releases.create).to.not.be.called
        expect(err).to.eql('fail packages')
      })
    })
  })

  describe('when creating release fails', () => {
    afterEach(() => {
      octopusApi.releases.create.restore()
    })

    it('rejects with an error', () => {
      sinon.stub(getProject, 'execute').callsFake(() => BPromise.resolve(mockProject))
      sinon.stub(getSelectedPackages, 'execute').callsFake(() => BPromise.resolve(selectedPackages))
      sinon.stub(octopusApi.releases, 'create').callsFake(() => BPromise.reject('an error'))

      return subject(releaseParams).catch(err => {
        expect(err).to.eql('an error')
      })
    })
  })
})
