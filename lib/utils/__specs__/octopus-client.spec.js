'use strict'

const { JSONCasing } = require('json-casing')
const request = require('request-promise-native')
const { Readable } = require('stream')

const testConfig = require('../../../test/client-config')
const { logger } = require('../logger')
const OctopusClient = require('../octopus-client')
const { sandbox } = require('../../../test/sandbox')

describe('utils/octopus-client', () => {
  const subject = new OctopusClient(testConfig)

  beforeEach(() => {
    sandbox.stub(logger, 'info')
    sandbox.stub(logger, 'error')
  })

  describe('#constructor', () => {
    let config

    beforeEach(() => {
      config = testConfig
    })

    describe('when config is provided', () => {
      it('initializes the client', () => {
        expect(new OctopusClient(config)).to.not.be.null
      })
    })

    describe('when client config is invalid', () => {
      it('throws when config is null', () => {
        config = null
        return expect(() => new OctopusClient(config)).to.throw('config is required in OctopusClient')
      })

      it('throws when config.host is missing', () => {
        config = {}
        return expect(() => new OctopusClient(config)).to.throw('host is required in OctopusClient')
      })

      it('throws when config.apiKey is missing', () => {
        config = { host: 'foo' }
        return expect(() => new OctopusClient(config)).to.throw('apiKey is required in OctopusClient')
      })
    })
  })

  describe('#get', () => {
    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const data = { Kerrigan: 'Queen of Blades', Raynor: 'Raynor\'s Raiders' }
        const expected = JSONCasing.toCamel(data)
        sandbox.stub(request, 'get').resolves(data)

        const actual = await subject.get('some-url')

        expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        sandbox.stub(request, 'get').rejects({ message: 'an error', options: { url: 'some-url', method: 'GET' } })

        const actual = await subject.get('some-url')

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute GET at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'GET', url: 'some-url' })
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'get').rejects({ message: 'an error' })

          const actual = await subject.get('some-url')

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })

  describe('#post', () => {
    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const data = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        const expected = JSONCasing.toCamel(data)
        sandbox.stub(request, 'post').resolves(data)

        const actual = await subject.post('some-url', { foo: 'bar' })

        return expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        sandbox.stub(request, 'post').rejects({ message: 'an error', options: { url: 'some-url', method: 'POST' } })

        const actual = await subject.post('some-url', { foo: 'bar' })

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute POST at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, data: undefined, method: 'POST', url: 'some-url' })
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'post').rejects({ message: 'an error' })

          const actual = await subject.post('some-url')

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })

  describe('#postFile', () => {
    const dataStream = new Readable({ read: () => true })

    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const url = 'welcome-to-hots'
        const fileName = 'hots-is-life'
        const data = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        const expected = JSONCasing.toCamel(data)
        const formData = {
          file: {
            value: dataStream,
            options: {
              filename: fileName,
              contentType: 'application/octet-stream'
            }
          }
        }
        const expectedOptions = {
          url,
          baseUrl: `${testConfig.host}/api`,
          headers: {
            'X-Octopus-ApiKey': testConfig.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'mutlipart/form-data'
          },
          formData,
          json: true
        }
        sandbox.stub(request, 'post').resolves(data)

        const actual = await subject.postFile(url, fileName, dataStream)

        expect(actual.value).to.deep.equal(expected)
        expect(request.post).to.have.been.calledWith(expectedOptions)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        sandbox.stub(request, 'post').rejects({ message: 'an error', options: { url: 'some-url', method: 'POST' } })

        const actual = await subject.postFile('some-url', 'some-file', dataStream)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute POST at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, formData: undefined, method: 'POST', url: 'some-url' })
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'post').rejects({ message: 'an error' })

          const actual = await subject.postFile('some-url', 'some-file', dataStream)

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })

  describe('#delete', () => {
    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const data = { Malfurion: 'Nature will rise against you', Tyrande: 'Light of Elune' }
        const expected = JSONCasing.toCamel(data)
        sandbox.stub(request, 'delete').resolves(data)

        const actual = await subject.delete('some-url')

        expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        sandbox.stub(request, 'delete').rejects({ message: 'an error', options: { url: 'some-url', method: 'DELETE' } })

        const actual = await subject.delete('some-url')

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute DELETE at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith({ baseUrl: undefined, headers: undefined, method: 'DELETE', url: 'some-url' })
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'delete').rejects({ message: 'an error' })

          const actual = await subject.delete('some-url')

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })
})
