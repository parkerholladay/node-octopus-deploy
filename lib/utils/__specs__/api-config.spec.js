'use strict'

const { clearApiConfig, getApiConfig, setApiConfig } = require('../api-config')
const { testConfig } = require('../../../test/api-config')

describe('utils/api-config', () => {
  beforeEach(() => {
    clearApiConfig()
  })

  describe('#setApiConfig', () => {
    let config

    beforeEach(() => {
      config = testConfig
    })

    describe('when config is provided', () => {
      it('sets the client config', () => {
        setApiConfig(config)
        expect(getApiConfig()).to.deep.equal(config)
      })
    })

    describe('when client config is invalid', () => {
      it('throws when config is null', () => {
        config = null
        return expect(() => setApiConfig(config)).to.throw('client config is required')
      })

      it('throws when config.host is missing', () => {
        config = {}
        return expect(() => setApiConfig(config)).to.throw('host is required in client config')
      })

      it('throws when config.apiKey is missing', () => {
        config = { host: 'foo' }
        return expect(() => setApiConfig(config)).to.throw('apiKey is required in client config')
      })

      it('does nothing when config is already set', () => {
        setApiConfig(config)
        return expect(() => setApiConfig(null)).to.not.throw
      })
    })
  })

  describe('#getApiConfig', () => {
    it('throws when config is null', () => {
      return expect(() => getApiConfig()).to.throw('client config has not been set')
    })
  })
})
