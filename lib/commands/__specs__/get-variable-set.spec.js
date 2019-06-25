'use strict'

const api = require('../../api')
const { execute: subject } = require('../get-variable-set')
require('../../../test/init-api')
const { generateVariableSet } = require('../../../test/mocks')
const { sandbox } = require('../../../test/sandbox')
const { logger, Maybe } = require('../../utils')

describe('commands/get-variable-set', () => {
  describe('#execute', () => {
    let variableSet

    beforeEach(() => {
      variableSet = generateVariableSet()

      sandbox.stub(api.variables, 'find').callsFake(async () => Maybe.some(variableSet))
      sandbox.stub(logger, 'error')
    })

    it('returns the variable set', async () => {
      const actual = await subject(variableSet.id)
      expect(actual.value).to.deep.equal(variableSet)
    })

    describe('when variable set does not exist', () => {
      it('returns none', async () => {
        variableSet = null
        const actual = await subject('does-not-exist')

        expect(actual.hasValue).to.be.false
        expect(logger.error).to.be.called
      })
    })
  })
})
