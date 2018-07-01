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
    afterEach(() => {
      client.postFile.restore()
    })

    it('creates a package', () => {
      const fileName = 'cursed-hollow'
      const fileStream = new Readable({ read: () => true })
      const expected = { success: true }
      sinon.stub(client, 'postFile').callsFake(() => BPromise.resolve(expected))

      return subject.create(fileName, fileStream).then(actual => {
        expect(actual).to.eql(expected)
        return expect(client.postFile).to.be.calledWith('/packages/raw', fileName, fileStream)
      })
    })
  })
})
