'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const OctopusClient = require('../../utils/octopus-client')
const Package = require('../package')

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
      sinon.stub(client, 'postFile').callsFake(() => BPromise.resolve(expected))
    })

    afterEach(() => {
      client.postFile.restore()
    })

    it('creates a package', () => {
      return subject.create(fileName, false, contents).then(actual => {
        expect(actual).to.eql(expected)
        return expect(client.postFile).to.be.calledWith('/packages/raw', fileName, contents)
      })
    })

    describe('when replace is true', () => {
      it('adds replace query string to url', () => {
        return subject.create(fileName, true, contents).then(actual => {
          expect(actual).to.eql(expected)
          return expect(client.postFile).to.be.calledWith('/packages/raw?replace=true', fileName, contents)
        })
      })
    })
  })
})
