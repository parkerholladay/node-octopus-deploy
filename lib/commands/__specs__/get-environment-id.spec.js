'use strict'

const { execute: subject } = require('../get-environment-id')
const { generateVariableSet } = require('../../../test/mocks')

describe('commands/get-environmment-id', () => {
  describe('#execute', () => {
    const projectSlug = 'blizzard.net'

    describe('when environment exists', () => {
      it('returns the id', () => {
        const environment = { id: 'battlefield-of-eternity', name: 'Battlefield of Eternity' }
        const variableSet = generateVariableSet({ scopeValues: { environments: [environment] } })

        return expect(subject(variableSet, projectSlug, environment.name)).to.eventually.equal(variableSet.scopeValues.environments[0].id)
      })
    })

    describe('when environment does not exist', () => {
      it('rejects with an error', () => {
        const invalidEnv = 'blackhearts-bay'

        return expect(subject(generateVariableSet(), projectSlug, invalidEnv)).to.eventually.be.rejectedWith(`Unable to find environment '${invalidEnv}' in variable set scope for project '${projectSlug}'`)
      })
    })
  })
})
