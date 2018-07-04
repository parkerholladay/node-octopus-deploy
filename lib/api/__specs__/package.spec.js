'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')
const { Readable } = require('stream')

const OctopusClient = require('../../utils/octopus-client')
const Package = require('../package')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Package(client)

describe('api/package', () => {
  describe('#create', () => {
    let fileName
    let fileStream
    let expected

    beforeEach(() => {
      fileName = 'cursed-hollow'
      fileStream = new Readable({ read: () => true })
      expected = { success: true }
      sinon.stub(client, 'postFile').callsFake(() => BPromise.resolve(expected))
    })

    afterEach(() => {
      client.postFile.restore()
    })

    it('creates a package', () => {
      return subject.create(fileName, false, fileStream).then(actual => {
        expect(actual).to.eql(expected)
        return expect(client.postFile).to.be.calledWith('/packages/raw', fileName, fileStream)
      })
    })

    describe('when replace is true', () => {
      it('adds replace query string to url', () => {
        return subject.create(fileName, true, fileStream).then(actual => {
          expect(actual).to.eql(expected)
          return expect(client.postFile).to.be.calledWith('/packages/raw?replace', fileName, fileStream)
        })
      })
    })
  })
})
