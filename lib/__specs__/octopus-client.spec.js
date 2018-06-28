'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const JSONCasing = require('json-casing').JSONCasing
const request = require('request-promise')
const sinon = require('sinon')

const testConfig = require('../../test/client-config')
const logger = require('../utils/logger')
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
      request.get.restore()
    })

    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Kerrigan: 'Queen of Blades', Raynor: 'Raynor\'s Raiders' }
        sinon.stub(request, 'get').callsFake(() => BPromise.resolve(expected))

        const subject = new OctopusClient(testConfig)
        return subject.get('some-url').then(actual => {
          return expect(actual).to.eql(JSONCasing.toCamel(expected))
        })
      })
    })

    describe('when request fails', () => {
      afterEach(() => {
        logger.info.restore()
        logger.error.restore()
      })

      it('returns empty object', () => {
        sinon.stub(request, 'get').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'GET' } }))
        sinon.stub(logger, 'info')
        sinon.stub(logger, 'error')

        const subject = new OctopusClient(testConfig)
        return subject.get('some-url').catch(err => {
          expect(err.message).to.eql('an error')
          expect(logger.error).to.be.calledWith(`Failed to get from 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', uri: 'some-url' })
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sinon.stub(request, 'get').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          sinon.stub(logger, 'info')
          sinon.stub(logger, 'error')

          const subject = new OctopusClient(testConfig)
          return subject.get('some-url').catch(_ => {
            expect(logger.error).to.be.called
            expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })

  describe('#post', () => {
    afterEach(() => {
      request.post.restore()
    })

    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        sinon.stub(request, 'post').callsFake(() => BPromise.resolve(expected))

        const subject = new OctopusClient(testConfig)
        return subject.post('some-url', { foo: 'bar' }).then(actual => {
          return expect(actual).to.eql(JSONCasing.toCamel(expected))
        })
      })
    })

    describe('when request fails', () => {
      afterEach(() => {
        logger.info.restore()
        logger.error.restore()
      })

      it('returns empty object and logs', () => {
        sinon.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'POST' } }))
        sinon.stub(logger, 'info')
        sinon.stub(logger, 'error')

        const subject = new OctopusClient(testConfig)
        return subject.post('some-url', { foo: 'bar' }).catch(err => {
          expect(err.message).to.eql('an error')
          expect(logger.error).to.be.calledWith(`Failed to post to 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'POST', uri: 'some-url', body: undefined })
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sinon.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          sinon.stub(logger, 'info')
          sinon.stub(logger, 'error')

          const subject = new OctopusClient(testConfig)
          return subject.post('some-url', { foo: 'bar' }).catch(_ => {
            expect(logger.error).to.be.called
            expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })

  describe('#delete', () => {
    afterEach(() => {
      request.delete.restore()
    })

    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Malfurion: 'Nature will rise against you', Tyrande: 'Light of Elune' }
        sinon.stub(request, 'delete').callsFake(() => BPromise.resolve(expected))

        const subject = new OctopusClient(testConfig)
        return subject.delete('some-url').then(actual => {
          return expect(actual).to.eql(JSONCasing.toCamel(expected))
        })
      })
    })

    describe('when request fails', () => {
      afterEach(() => {
        logger.info.restore()
        logger.error.restore()
      })

      it('returns empty object', () => {
        sinon.stub(request, 'delete').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'GET' } }))
        sinon.stub(logger, 'info')
        sinon.stub(logger, 'error')

        const subject = new OctopusClient(testConfig)
        return subject.delete('some-url').catch(err => {
          expect(err.message).to.eql('an error')
          expect(logger.error).to.be.calledWith(`Failed to delete from 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', uri: 'some-url' })
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sinon.stub(request, 'delete').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          sinon.stub(logger, 'info')
          sinon.stub(logger, 'error')

          const subject = new OctopusClient(testConfig)
          return subject.delete('some-url').catch(_ => {
            expect(logger.error).to.be.called
            expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })
})
