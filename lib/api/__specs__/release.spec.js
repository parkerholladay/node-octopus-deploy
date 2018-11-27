'use strict'

const BPromise = require('bluebird')

const OctopusClient = require('../../utils/octopus-client')
const Release = require('../release')
const createRelease = require('../../../test/mocks/release')
const sandbox = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Release(client)

describe('api/release', () => {
  describe('#find', () => {
    it('finds a release', () => {
      const release = createRelease()
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(release))

      return subject.find(release.id).then(actual => {
        expect(client.get).to.be.calledWith(`/releases/${release.id}`)
        return expect(actual).to.deep.equal(release)
      })
    })
  })

  describe('#create', () => {
    it('creates a release', () => {
      const projectId = 'garden-terror'
      const version = '2.0.0-rc-3'
      const releaseNotes = 'Release notes for testing'
      const selectedPackages = [{ stepName: 'Gather my seeds', version: '2.0.0' }]
      const releaseParams = { projectId, version, selectedPackages, releaseNotes }
      const release = createRelease({ projectId, version, releaseNotes, selectedPackages })
      sandbox.stub(client, 'post').callsFake(() => BPromise.resolve(release))

      return subject.create(releaseParams).then(actual => {
        expect(client.post).to.be.calledWith('/releases', releaseParams)
        return expect(actual).to.deep.equal(release)
      })
    })
  })
})
