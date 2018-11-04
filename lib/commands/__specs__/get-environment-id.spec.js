'use strict'

const subject = require('../get-environment-id').execute
const createVariableSet = require('../../../test/mocks/variable-set')

describe('commands/get-environmment-id', () => {
  const projectSlug = 'blizzard.net'

  describe('when environment exists', () => {
    it('returns the id', () => {
      const environment = { id: 'battlefield-of-eternity', name: 'Battlefield of Eternity' }
      const variableSet = createVariableSet({ scopeValues: { environments: [environment] } })

      return subject(variableSet, projectSlug, environment.name).then(id => {
        return expect(id).to.eql(variableSet.scopeValues.environments[0].id)
      })
    })
  })

  describe('when environment does not exist', () => {
    it('rejects with an error', () => {
      const invalidEnv = 'blackhearts-bay'

      return subject(createVariableSet(), projectSlug, invalidEnv).catch(err => {
        expect(err.message).to.eql(`Unable to find environment '${invalidEnv}' in variable set scope for project '${projectSlug}'`)
      })
    })
  })
})
