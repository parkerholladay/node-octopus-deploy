'use strict'

const { expect } = require('chai')

const subject = require('../get-form-values').execute
const createVariableSet = require('../../../test/mocks/variable-set')

describe('commands/get-form-values', () => {
  const environment = { id: 'the-nexus', name: 'Heroes of the Storm' }
  const variable = { name: 'stitches', value: 'Can stitches play now?' }
  const variableSet = createVariableSet({
    scopeValues: { environments: [environment] },
    variables: [{
      name: variable.name,
      scope: { environment: [environment.id] },
      value: ''
    }]
  })

  describe('when variables are provided', () => {
    it('returns formValues', () => {
      const deployVariables = { [variable.name]: variable.value }
      const variableId = variableSet.variables.filter(v => v.name === variable.name && v.scope.environment.includes(environment.id))[0].id
      const formValues = { [variableId]: variable.value }

      return subject(deployVariables, variableSet, environment.id, environment.name).then(actual => {
        return expect(actual).to.eql(formValues)
      })
    })
  })

  describe('when variables are empty', () => {
    it('returns empty formValues', () => {
      const deployVariables = {}

      return subject(deployVariables, variableSet, environment.id, environment.name).then(actual => {
        return expect(actual).to.eql({})
      })
    })
  })

  describe('when variable does not exist', () => {
    it('rejects with an error', () => {
      const badVariable = { Greymane: 'I am the lord of my pack' }
      return subject(badVariable, variableSet, environment.id, environment.name).catch(err => {
        expect(err.message).to.eql(`No variable 'Greymane' with scope '${environment.name}' found in variable set`)
      })
    })
  })

  describe('when duplicate variable exists', () => {
    it('rejects with an error', () => {
      const deployVariables = { [variable.name]: variable.value }
      const invalidVariableSet = Object.assign({}, variableSet, {
        variables: [variableSet.variables[0], variableSet.variables[0]]
      })

      return subject(deployVariables, invalidVariableSet, environment.id, environment.name).catch(err => {
        expect(err.message).to.eql(`More than one variable '${variableSet.variables[0].name}' with scope '${environment.name}' found in variable set`)
      })
    })
  })
})
