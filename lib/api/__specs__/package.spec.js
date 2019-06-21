'use strict'

const { Maybe } = require('../../utils/maybe')
const OctopusClient = require('../../utils/octopus-client')
const Package = require('../package')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Package(client)

describe('api/package', () => {
  describe('#create', () => {
    let fileName
    let contents
    let expected

    beforeEach(() => {
      fileName = 'cursed-hollow'
      contents = Buffer.from('hots-is-life')
      expected = { success: true }
      sandbox.stub(client, 'postFile').callsFake(async () => Maybe.some(expected))
    })

    it('creates a package', async () => {
      const actual = await subject.create(fileName, false, contents)
      expect(actual.value).to.deep.equal(expected)
      expect(client.postFile).to.be.calledWith('/packages/raw', fileName, contents)
    })

    describe('when replace is true', () => {
      it('adds replace query string to url', async () => {
        const actual = await subject.create(fileName, true, contents)
        expect(actual.value).to.deep.equal(expected)
        expect(client.postFile).to.be.calledWith('/packages/raw?replace=true', fileName, contents)
      })
    })

    describe('when create package fails', () => {
      it('returns none', async () => {
        expected = null
        const actual = await subject.create(fileName, true, contents)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
