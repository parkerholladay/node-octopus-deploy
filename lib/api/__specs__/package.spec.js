'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')
const { Readable } = require('stream')

const OctopusClient = require('../../octopus-client')
const Release = require('../package')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Release(client)

describe('api/package', () => {
  describe('#create', () => {
    afterEach(() => {
      client.postFileStream.restore()
    })

    it('creates a package', () => {
      const fileName = 'cursed-hollow'
      const fileStream = new Readable({ read: () => true })
      const expected = { success: true }
      sinon.stub(client, 'postFileStream').callsFake(() => BPromise.resolve(expected))

      return subject.create(fileName, fileStream).then(actual => {
        expect(actual).to.eql(expected)
        return expect(client.postFileStream).to.be.calledWith('/packages/raw', fileName, fileStream)
      })
    })
  })
})
