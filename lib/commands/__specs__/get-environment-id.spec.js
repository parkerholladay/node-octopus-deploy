'use strict'

const { execute: subject } = require('../get-environment-id')
const { Maybe } = require('../../utils/maybe')
const { generateVariableSet } = require('../../../test/mocks')

describe('commands/get-environmment-id', () => {
  describe('#execute', () => {
    const projectSlug = 'blizzard.net'

    describe('when environment exists', () => {
      it('returns the id', () => {
        const environment = { id: 'battlefield-of-eternity', name: 'Battlefield of Eternity' }
        const variableSet = generateVariableSet({ scopeValues: { environments: [environment] } })
        const expected = Maybe.some(variableSet.scopeValues.environments[0].id)

        const actual = subject(variableSet, projectSlug, environment.name)

        expect(actual).to.deep.equal(expected)
      })
    })

    describe('when environment does not exist', () => {
      it('returns none', () => {
        const invalidEnv = 'blackhearts-bay'
        const actual = subject(generateVariableSet(), projectSlug, invalidEnv)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
