'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const request = require('request-promise')
const sinon = require('sinon')

const testConfig = require('../../test/client-config')
const logger = require('../logger')
const OctopusClient = require('../octopus-client')

describe('octopus-client', () => {
  describe('#constructor', () => {
    describe('when config is provided', () => {
      it('initializes the client', () => {
        expect(new OctopusClient(testConfig)).to.not.be.null
      })
    })

    describe('when client config is invalid', () => {
      it('throws when config is null', () => {
        return expect(() => new OctopusClient()).to.throw('config is required in OctopusClient')
      })

      it('throws when config.host is missing', () => {
        const config = {}
        return expect(() => new OctopusClient(config)).to.throw('host is required in OctopusClient')
      })

      it('throws when config.apiKey is missing', () => {
        const config = { host: 'foo' }
        return expect(() => new OctopusClient(config)).to.throw('apiKey is required in OctopusClient')
      })
    })
  })

  describe('#get', () => {
    afterEach(() => {
      sinon.restore(request.get)
      sinon.restore(logger.info)
      sinon.restore(logger.error)
    })

    describe('when request is successful', () => {
      it('returns parsed json data', () => {
        const expected = { 'kerrigan': 'Queen of Blades', 'raynor': 'Raynor\'s Raiders' }
        sinon.stub(request, 'get', () => BPromise.resolve(expected))

        const subject = new OctopusClient(testConfig)
        return subject.get('some-url').then(actual => {
          expect(actual).to.eql(expected)
        })
      })
    })

    describe('when request fails', () => {
      it('returns empty object', () => {
        sinon.stub(request, 'get', () => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'GET' } }))
        sinon.stub(logger, 'info')
        sinon.stub(logger, 'error')

        const subject = new OctopusClient(testConfig)
        return subject.get('some-url').catch(err => {
          expect(err.message).to.eql('an error')
          expect(logger.error).to.be.calledWith(`Failed to get from 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', uri: 'some-url' })
        })
      })
    })
  })

  describe('#post', () => {
    afterEach(() => {
      sinon.restore(request.post)
      sinon.restore(logger.info)
      sinon.restore(logger.error)
    })

    describe('when request is successful', () => {
      it('returns parsed json data', () => {
        const expected = { 'diablo': 'I am fear incarnate', 'butcher': 'Fresh meat' }
        sinon.stub(request, 'post', () => BPromise.resolve(expected))

        const subject = new OctopusClient(testConfig)
        return subject.post('some-url', { foo: 'bar' }).then(actual => {
          expect(actual).to.eql(expected)
        })
      })
    })

    describe('when request fails', () => {
      it('returns empty object and logs', () => {
        sinon.stub(request, 'post', () => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'POST' } }))
        sinon.stub(logger, 'info')
        sinon.stub(logger, 'error')

        const subject = new OctopusClient(testConfig)
        return subject.post('some-url', { foo: 'bar' }).catch(err => {
          expect(err.message).to.eql('an error')
          expect(logger.error).to.be.calledWith(`Failed to post to 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'POST', uri: 'some-url', body: undefined })
        })
      })
    })
  })
})
