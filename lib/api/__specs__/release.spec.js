'use strict'

const { Maybe } = require('../../utils/maybe')
const { generateRelease } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const Release = require('../release')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Release(client)

describe('api/release', () => {
  describe('#find', () => {
    let release

    beforeEach(() => {
      release = generateRelease()
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(release))
    })

    it('finds a release', async () => {
      const actual = await subject.find(release.id)
      expect(actual.value).to.deep.equal(release)
      expect(client.get).to.be.calledWith(`/releases/${release.id}`)
    })

    describe('when release does not exist', () => {
      it('returns none', async () => {
        release = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })

  describe('#create', () => {
    const projectId = 'garden-terror'
    const version = '2.0.0-rc-3'
    const releaseNotes = 'Release notes for testing'
    const selectedPackages = [{ stepName: 'Gather my seeds', version: '2.0.0' }]
    const releaseParams = { projectId, version, selectedPackages, releaseNotes }

    let release

    beforeEach(() => {
      release = generateRelease({ projectId, version, releaseNotes, selectedPackages })
      sandbox.stub(client, 'post').callsFake(async () => Maybe.some(release))
    })

    it('creates a release', async () => {
      const actual = await subject.create(releaseParams)
      expect(actual.value).to.deep.equal(release)
      expect(client.post).to.be.calledWith('/releases', releaseParams)
    })

    describe('when create release fails', () => {
      it('returns none', async () => {
        release = null
        const actual = await subject.create(releaseParams)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
