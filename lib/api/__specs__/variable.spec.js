'use strict'

const { Maybe } = require('../../utils/maybe')
const { generateVariableSet } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const { sandbox } = require('../../../test/sandbox')
const Variable = require('../variable')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Variable(client)

describe('api/variable', () => {
  describe('#find', () => {
    let variableSet

    beforeEach(() => {
      variableSet = generateVariableSet()
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(variableSet))
    })

    it('finds the variable set', async () => {
      const actual = await subject.find(variableSet.id)
      expect(actual.value).to.deep.equal(variableSet)
      expect(client.get).to.be.calledWith(`/variables/${variableSet.id}`)
    })

    describe('when variable set does not exist', () => {
      it('returns none', async () => {
        variableSet = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
