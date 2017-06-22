'use strict'

const { expect } = require('chai')

const subject = require('../get-form-values').execute
const mockVariableSet = require('../../../test/mocks/mock-variable')

describe('commands/get-form-values', () => {
  const environment = mockVariableSet.ScopeValues.Environments[0]
  describe('when variables are provided', () => {
    it('returns formValues', () => {
      const variables = { SourceDir: '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }
      const expected = { 'd02ff723-6fdb-2011-792d-ad99eaa3e0bb': '\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3' }

      return subject(variables, mockVariableSet, environment.Id, environment.Name).then(formValues => {
        return expect(formValues).to.eql(expected)
      })
    })
  })

  describe('when variables are empty', () => {
    it('returns empty formValues', () => {
      const variables = {}

      return subject(variables, mockVariableSet, environment.Id, environment.Name).then(formValues => {
        return expect(formValues).to.eql({})
      })
    })
  })

  describe('when variable does not exist', () => {
    it('throws an error', () => {
      const invalidVariableSet = Object.assign({}, mockVariableSet, { Variables: [] })

      return subject({ foo: 'bar' }, invalidVariableSet, environment.Id, environment.Name).catch(err => {
        expect(err.message).to.eql(`No variable 'foo' with scope '${environment.Name}' found in variable set`)
      })
    })
  })

  describe('when duplicate variable exists', () => {
    it('throws an error', () => {
      const variables = { [mockVariableSet.Variables[0].Name]: 'bar' }
      const invalidVariableSet = Object.assign({}, mockVariableSet, {
        Variables: [mockVariableSet.Variables[0], mockVariableSet.Variables[0]]
      })

      return subject(variables, invalidVariableSet, environment.Id, environment.Name).catch(err => {
        expect(err.message).to.eql(`More than one variable '${mockVariableSet.Variables[0].Name}' with scope '${environment.Name}' found in variable set`)
      })
    })
  })
})
