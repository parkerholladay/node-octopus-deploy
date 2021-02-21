'use strict'

require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const client = require('../../octopus-client')
const { sandbox } = require('../../../test/sandbox')
const subject = require('../space')
const { expect } = require('chai')
const { generateSpace } = require('../../../test/mocks')

describe('api/space', () => {
  describe('#findAll', () => {
    let spaces

    beforeEach(() => {
      spaces = [generateSpace({})]
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(spaces))
    })

    describe('when called', () => {
      it('returns list of spaces', async () => {
        const actual = await subject.findAll()
        expect(actual.hasValue).to.equal(true)
        expect(actual.value).to.equal(spaces)
      })
    })
  })
})
