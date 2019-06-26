'use strict'

const { JSONCasing } = require('json-casing')
const request = require('request-promise-native')

require('../../test/init-api')
const { delete: clientDelete, get, post, postFile } = require('../octopus-client')
const { sandbox } = require('../../test/sandbox')
const { getApiConfig, logger } = require('../utils')

describe('octopus-client', () => {
  beforeEach(() => {
    sandbox.stub(logger, 'info')
    sandbox.stub(logger, 'error')
  })

  describe('#get', () => {
    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const data = { Kerrigan: 'Queen of Blades', Raynor: 'Raynor\'s Raiders' }
        const expected = JSONCasing.toCamel(data)
        sandbox.stub(request, 'get').resolves(data)

        const actual = await get('some-url')

        expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        const errorOptions = { url: 'some-url', method: 'GET', baseUrl: 'https://octopus.acme.com', headers: {} }
        sandbox.stub(request, 'get').rejects({ message: 'an error', options: errorOptions })

        const actual = await get('some-url')

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute GET at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith(errorOptions)
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'get').rejects({ message: 'an error' })

          const actual = await get('some-url')

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

        const actual = await post('some-url', { foo: 'bar' })

        return expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        const data = { foo: 'bar' }
        const errorOptions = { url: 'some-url', method: 'POST', baseUrl: 'https://octopus.acme.com', headers: {}, body: data }
        let { body, ...expectedLog } = errorOptions
        expectedLog = { ...expectedLog, data: body }
        sandbox.stub(request, 'post').rejects({ message: 'an error', options: errorOptions })

        const actual = await post('some-url', data)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute POST at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith(expectedLog)
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'post').rejects({ message: 'an error' })

          const actual = await post('some-url')

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })

  describe('#postFile', () => {
    const contents = Buffer.from(JSON.stringify({ hots: 'life' }))

    describe('when request is successful', () => {
      it('returns camelized json data wrapped in maybe', async () => {
        const url = 'welcome-to-hots'
        const fileName = 'hots-is-life'
        const data = { Diablo: 'I am fear incarnate', Butcher: 'Fresh meat' }
        const expected = JSONCasing.toCamel(data)
        const formData = {
          file: {
            value: contents,
            options: {
              filename: fileName,
              contentType: 'application/octet-stream'
            }
          }
        }
        const config = getApiConfig()
        const expectedOptions = {
          url,
          method: 'POST',
          baseUrl: `${config.host}/api`,
          headers: {
            'X-Octopus-ApiKey': config.apiKey,
            'Accept': 'application/json',
            'Content-Type': 'mutlipart/form-data'
          },
          formData,
          json: true
        }
        sandbox.stub(request, 'post').resolves(data)

        const actual = await postFile(url, fileName, contents)

        expect(actual.value).to.deep.equal(expected)
        expect(request.post).to.have.been.calledWith(expectedOptions)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        const errorOptions = { url: 'some-url', method: 'POST', baseUrl: 'https://octopus.acme.com', headers: {}, formData: {} }
        sandbox.stub(request, 'post').rejects({ message: 'an error', options: errorOptions })

        const actual = await postFile('some-url', 'some-file', contents)

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute POST at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith(errorOptions)
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'post').rejects({ message: 'an error' })

          const actual = await postFile('some-url', 'some-file', contents)

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

        const actual = await clientDelete('some-url')

        expect(actual.value).to.deep.equal(expected)
      })
    })

    describe('when request fails', () => {
      it('returns none', async () => {
        const errorOptions = { url: 'some-url', method: 'DELETE', baseUrl: 'https://octopus.acme.com', headers: {} }
        sandbox.stub(request, 'delete').rejects({ message: 'an error', options: errorOptions })

        const actual = await clientDelete('some-url')

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.calledWith(`Failed to execute DELETE at 'some-url'. Error: an error`)
        expect(logger.info).to.be.calledWith(errorOptions)
      })

      describe('when error config is not available', () => {
        it('does not log error response info', async () => {
          sandbox.stub(request, 'delete').rejects({ message: 'an error' })

          const actual = await clientDelete('some-url')

          expect(actual.hasValue).to.be.false
          expect(logger.error).to.be.called
          expect(logger.info).to.be.not.called
        })
      })
    })
  })
})
