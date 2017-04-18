'use strict'

const { expect } = require('chai')

const subject = require('../get-environment-id').execute
const mockVariable = require('../../../test/mocks/mock-variable')

describe('commands/get-environmment-id', () => {
  const projectSlug = 'My-Project-Name'
  describe('when environment exists', () => {
    it('returns the id', () => {
      const environmentName = 'DEV-SERVER'

      return subject(mockVariable, projectSlug, environmentName).then(id => {
        expect(id).to.eql(mockVariable.ScopeValues.Environments.find(env => env.Name === environmentName).Id)
      })
    })
  })

  describe('when environment does not exist', () => {
    it('throws an error', () => {
      const invalidEnv = 'wrong-env'

      return subject(mockVariable, projectSlug, invalidEnv).catch(err => {
        expect(err.message).to.eql(`Unable to find environment '${invalidEnv}' in variable set scope for project '${projectSlug}'`)
      })
    })
  })
})
