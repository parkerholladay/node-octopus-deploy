'use strict'

const api = require('../../api')
const { execute: subject } = require('../set-space')
require('../../../test/init-api')
const { generateSpace } = require('../../../test/mocks')
const { sandbox } = require('../../../test/sandbox')
const { Maybe, setApiConfig, getApiConfig } = require('../../utils')

describe('commands/set-space', () => {
  describe('#execute', () => {
    let spaces
    const space = {
      name: 'needle',
      id: 'Spaces-22'
    }
    const initConfig = { host: 'host', apiKey: 'apiKey' }

    beforeEach(() => {
      spaces = [
        { name: 'haystack1', id: 'Spaces-11' },
        { name: 'haystack2', id: 'Spaces-12' },
        space,
        { name: 'haystack3', id: 'Spaces-12' }
      ].map(generateSpace)

      setApiConfig(initConfig)
      sandbox
        .stub(api.spaces, 'findAll')
        .callsFake(async () => Maybe.some(spaces))
    })

    describe('when the space is present', () => {
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
  })
})
