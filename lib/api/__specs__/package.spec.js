'use strict'

const BPromise = require('bluebird')

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
      sandbox.stub(client, 'postFile').callsFake(() => BPromise.resolve(expected))
    })

    it('creates a package', () => {
      return subject.create(fileName, false, contents).then(actual => {
        expect(client.postFile).to.be.calledWith('/packages/raw', fileName, contents)
        return expect(actual).to.deep.equal(expected)
      })
    })

    describe('when replace is true', () => {
      it('adds replace query string to url', () => {
        return subject.create(fileName, true, contents).then(actual => {
          expect(client.postFile).to.be.calledWith('/packages/raw?replace=true', fileName, contents)
          return expect(actual).to.deep.equal(expected)
        })
      })
    })
  })
})
