'use strict'

const { execute: subject } = require('../get-form-values')
const { generateVariableSet } = require('../../../test/mocks')
const { Maybe } = require('../../utils')

describe('commands/get-form-values', () => {
  describe('#execute', () => {
    const environment = { id: 'the-nexus', name: 'Heroes of the Storm' }
    const variable = { name: 'Stitches', value: 'Can stitches play now?' }
    const variableSet = generateVariableSet({
      scopeValues: { environments: [environment] },
      variables: [{
        id: variable.name.toLowerCase(),
        name: variable.name,
        scope: { environment: [environment.id] },
        value: ''
      }]
    })

    describe('when variables are provided', () => {
      it('returns formValues', () => {
        const deployVariables = { [variable.name]: variable.value }
        const variableId = variableSet.variables.filter(v => v.name === variable.name && v.scope.environment.includes(environment.id))[0].id
        const expected = Maybe.some({ [variableId]: variable.value })

        const actual = subject(deployVariables, variableSet, environment.id, environment.name)

        expect(actual).to.deep.equal(expected)
      })
    })

    describe('when variables are empty', () => {
      it('returns empty formValues', () => {
        const deployVariables = {}
        const expected = Maybe.some({})

        const actual = subject(deployVariables, variableSet, environment.id, environment.name)

        expect(actual).to.deep.equal(expected)
      })
    })

    describe('when variable does not exist', () => {
      it('returns none', () => {
        const badVariable = { Greymane: 'I am the lord of my pack' }
        const actual = subject(badVariable, variableSet, environment.id, environment.name)
        expect(actual.hasValue).to.be.false
      })
    })

    describe('when duplicate variable exists', () => {
      it('returns none', () => {
        const deployVariables = { [variable.name]: variable.value }
        const invalidVariableSet = {
          ...variableSet,
          variables: [variableSet.variables[0], variableSet.variables[0]]
        }

        const actual = subject(deployVariables, invalidVariableSet, environment.id, environment.name)

        expect(actual.hasValue).to.be.false
      })
    })
  })
})
