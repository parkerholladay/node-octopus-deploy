'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const mockRelease = require('../../../test/mocks/mock-release')
const OctopusClient = require('../../octopus-client')
const Release = require('../release')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Release(client)

describe('api/release', () => {
  afterEach(() => {
    sinon.restore(client.get)
    sinon.restore(client.post)
  })

  describe('#find', () => {
    it('finds a release', () => {
      const releaseId = Math.floor(Math.random() * 100)
      sinon.stub(client, 'get', () => BPromise.resolve(mockRelease))

      return subject.find(releaseId).then(release => {
        expect(release).to.eql(mockRelease)
        expect(client.get).to.be.calledWith(`/releases/${releaseId}`)
      })
    })
  })

  describe('#create', () => {
    it('creates a release', () => {
      const projectId = 'project-123'
      const version = '1.0.0-rc-3'
      const releaseNotes = 'Release notes for testing'
      const selectedPackages = [{ 'StepName': 'Step 1', 'Version': '1.0.0-rc-3' }]
      const createParams = {
        ProjectId: projectId,
        ReleaseNotes: releaseNotes,
        Version: version,
        SelectedPackages: selectedPackages
      }
      sinon.stub(client, 'post', () => BPromise.resolve(mockRelease))

      return subject.create(projectId, version, releaseNotes, selectedPackages).then(release => {
        expect(release).to.eql(mockRelease)
        expect(client.post).to.be.calledWith('/releases', createParams)
      })
    })
  })
})
