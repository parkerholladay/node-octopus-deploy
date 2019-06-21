'use strict'

const BPromise = require('bluebird')

const { generateVariableSet } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const { sandbox } = require('../../../test/sandbox')
const Variable = require('../variable')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Variable(client)

describe('api/variable', () => {
  describe('#find', () => {
    it('should find a variable', () => {
      const variableSet = generateVariableSet()
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(variableSet))

      return subject.find(variableSet.id).then(actual => {
        expect(client.get).to.be.calledWith(`/variables/${variableSet.id}`)
        return expect(actual).to.deep.equal(variableSet)
      })
    })
  })
})
