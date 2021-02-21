'use strict'

const api = require('../../api')
const { execute: subject } = require('../ensure-space-set')
require('../../../test/init-api')
const { generateSpace } = require('../../../test/mocks')
const { sandbox } = require('../../../test/sandbox')
const { Maybe, setApiConfig, getApiConfig } = require('../../utils')
const { expect, assert } = require('chai')

describe('commands/set-space', () => {
  describe('#execute', () => {
    let spaces
    const space = {
      name: 'needle',
      id: 'Spaces-22'
    }
    const initConfig = { host: 'host', apiKey: 'apiKey' }

    beforeEach(() => {
      setApiConfig(initConfig)
      sandbox
        .stub(api.spaces, 'findAll')
        .callsFake(async () => Maybe.some(spaces))
    })

    describe('when the space is present', () => {
      beforeEach(() => {
        spaces = [
          { name: 'haystack1', id: 'Spaces-11' },
          { name: 'haystack2', id: 'Spaces-12' },
          space,
          { name: 'haystack3', id: 'Spaces-12' }
        ].map(generateSpace)
      })
      it('updates the configuration with the id', async () => {
        const expectedConfig = {
          ...initConfig,
          spaceId: space.id
        }
        await subject(space.name)

        const actualConfig = getApiConfig()
        expect(actualConfig).to.deep.equal(expectedConfig)
        expect(api.spaces.findAll).to.have.been.calledOnce
      })
    })
    describe('when the space is missing', () => {
      beforeEach(() => {
        spaces = [
          { name: 'haystack1', id: 'Spaces-11' },
          { name: 'haystack2', id: 'Spaces-12' },
          { name: 'haystack3', id: 'Spaces-12' }
        ].map(generateSpace)
      })
      it('throws an error', async () => {
        try {
          await subject(space.name)
          assert.fail()
        } catch (e) {
          expect(e.message).to.equal("Unable to set space 'needle'")
        }

        const actualConfig = getApiConfig()
        expect(actualConfig).to.deep.equal(initConfig)
        expect(api.spaces.findAll).to.have.been.calledOnce
      })
    })

    describe('when no space is provided', () => {
      it('returns without any side effects', async () => {
        const expectedConfig = {
          ...initConfig
        }
        await subject(null)

        const actualConfig = getApiConfig()
        expect(actualConfig).to.deep.equal(expectedConfig)
        expect(api.spaces.findAll).to.not.have.been.called
      })
    })
  })
})
