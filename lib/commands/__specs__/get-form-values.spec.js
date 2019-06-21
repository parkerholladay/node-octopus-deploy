'use strict'

const { execute: subject } = require('../get-form-values')
const { generateVariableSet } = require('../../../test/mocks')

describe('commands/get-form-values', () => {
  describe('#execute', () => {
    const environment = { id: 'the-nexus', name: 'Heroes of the Storm' }
    const variable = { name: 'stitches', value: 'Can stitches play now?' }
    const variableSet = generateVariableSet({
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

        return expect(subject(deployVariables, variableSet, environment.id, environment.name)).to.eventually.deep.equal(formValues)
      })
    })

    describe('when variables are empty', () => {
      it('returns empty formValues', () => {
        const deployVariables = {}

        return expect(subject(deployVariables, variableSet, environment.id, environment.name)).to.eventually.deep.equal({})
      })
    })

    describe('when variable does not exist', () => {
      it('rejects with an error', () => {
        const badVariable = { Greymane: 'I am the lord of my pack' }
        return expect(subject(badVariable, variableSet, environment.id, environment.name)).to.eventually.be.rejectedWith(`No variable 'Greymane' with scope '${environment.name}' found in variable set`)
      })
    })

    describe('when duplicate variable exists', () => {
      it('rejects with an error', () => {
        const deployVariables = { [variable.name]: variable.value }
        const invalidVariableSet = Object.assign({}, variableSet, {
          variables: [variableSet.variables[0], variableSet.variables[0]]
        })

        return expect(subject(deployVariables, invalidVariableSet, environment.id, environment.name)).to.eventually.be.rejectedWith(`More than one variable '${variableSet.variables[0].name}' with scope '${environment.name}' found in variable set`)
      })
    })
  })
})
