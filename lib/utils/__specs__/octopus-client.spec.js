'use strict'

const BPromise = require('bluebird')
const JSONCasing = require('json-casing').JSONCasing
const request = require('request-promise')
const { Readable } = require('stream')

const testConfig = require('../../../test/client-config')
const logger = require('../logger')
const OctopusClient = require('../octopus-client')
const sandbox = require('../../../test/sandbox')

describe('utils/octopus-client', () => {
  beforeEach(() => {
    sandbox.stub(logger, 'info')
    sandbox.stub(logger, 'error')
  })

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
    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Kerrigan: 'Queen of Blades', Raynor: 'Raynor\'s Raiders' }
        sandbox.stub(request, 'get').callsFake(() => BPromise.resolve(expected))
        const subject = new OctopusClient(testConfig)

        return expect(subject.get('some-url')).to.eventually.deep.equal(JSONCasing.toCamel(expected))
      })
    })

    describe('when request fails', () => {
      it('returns empty object', () => {
        sandbox.stub(request, 'get').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'GET' } }))
        const subject = new OctopusClient(testConfig)

        return subject.get('some-url').catch(err => {
          expect(logger.error).to.be.calledWith(`Failed to get from 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', uri: 'some-url' })
          return expect(err.message).to.equal('an error')
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sandbox.stub(request, 'get').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          const subject = new OctopusClient(testConfig)

          return subject.get('some-url').catch(() => {
            expect(logger.error).to.be.called
            return expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })

  describe('#post', () => {
    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        sandbox.stub(request, 'post').callsFake(() => BPromise.resolve(expected))
        const subject = new OctopusClient(testConfig)

        return expect(subject.post('some-url', { foo: 'bar' })).to.eventually.deep.equal(JSONCasing.toCamel(expected))
      })
    })

    describe('when request fails', () => {
      it('returns empty object and logs', () => {
        sandbox.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'POST' } }))
        const subject = new OctopusClient(testConfig)

        return subject.post('some-url', { foo: 'bar' }).catch(err => {
          expect(logger.error).to.be.calledWith(`Failed to post to 'some-url'. Error: an error`)
          expect(logger.info).to.be.called
          return expect(err.message).to.equal('an error')
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sandbox.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          const subject = new OctopusClient(testConfig)

          return subject.post('some-url', { foo: 'bar' }).catch(() => {
            expect(logger.error).to.be.called
            return expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })

  describe('#postFile', () => {
    const dataStream = new Readable({ read: () => true })

    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const url = 'welcome-to-hots'
        const fileName = 'hots-is-life'
        const expected = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        const expectedOptions = {
          baseUrl: testConfig.host + '/api',
          uri: url,
          headers: {
            'X-Octopus-ApiKey': testConfig.apiKey,
            'Content-Type': 'mutlipart/form-data'
          },
          formData: {
            file: {
              value: dataStream,
              options: {
                filename: fileName,
                contentType: 'application/octet-stream'
              }
            }
          },
          json: true,
          method: 'POST',
          pool: undefined
        }
        sandbox.stub(request, 'post').callsFake(() => BPromise.resolve(expected))
        const subject = new OctopusClient(testConfig)

        return subject.postFile(url, fileName, dataStream).then(actual => {
          expect(request.post).to.have.been.calledWith(expectedOptions)
          return expect(actual).to.deep.equal(JSONCasing.toCamel(expected))
        })
      })
    })

    describe('when request fails', () => {
      it('returns empty object and logs', () => {
        sandbox.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'POST' } }))
        const subject = new OctopusClient(testConfig)

        return subject.postFile('some-url', 'some-file', dataStream).catch(err => {
          expect(logger.error).to.be.calledWith(`Failed to post file to 'some-url'. Error: an error`)
          expect(logger.info).to.be.called
          return expect(err.message).to.equal('an error')
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sandbox.stub(request, 'post').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          const subject = new OctopusClient(testConfig)

          return subject.postFile('some-url', 'some-file', dataStream).catch(() => {
            expect(logger.error).to.be.called
            return expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })

  describe('#delete', () => {
    describe('when request is successful', () => {
      it('returns camelized json data', () => {
        const expected = { Malfurion: 'Nature will rise against you', Tyrande: 'Light of Elune' }
        sandbox.stub(request, 'delete').callsFake(() => BPromise.resolve(expected))
        const subject = new OctopusClient(testConfig)

        return expect(subject.delete('some-url')).to.eventually.deep.equal(JSONCasing.toCamel(expected))
      })
    })

    describe('when request fails', () => {
      it('returns empty object', () => {
        sandbox.stub(request, 'delete').callsFake(() => BPromise.reject({ message: 'an error', options: { uri: 'some-url', method: 'GET' } }))
        const subject = new OctopusClient(testConfig)

        return subject.delete('some-url').catch(err => {
          expect(logger.error).to.be.calledWith(`Failed to delete from 'some-url'. Error: an error`)
          expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', uri: 'some-url' })
          return expect(err.message).to.equal('an error')
        })
      })

      describe('when failure options are not available', () => {
        it('does not log error response info', () => {
          sandbox.stub(request, 'delete').callsFake(() => BPromise.reject({ message: 'an error', options: null }))
          const subject = new OctopusClient(testConfig)

          return subject.delete('some-url').catch(() => {
            expect(logger.error).to.be.called
            return expect(logger.info).to.not.be.called
          })
        })
      })
    })
  })
})
