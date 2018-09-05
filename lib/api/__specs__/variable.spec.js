'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')

const createVariableSet = require('../../../test/mocks/variable-set')
const OctopusClient = require('../../utils/octopus-client')
const sandbox = require('../../../test/sandbox')
const Variable = require('../variable')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Variable(client)

describe('api/variable', () => {
  describe('#find', () => {
    it('should find a variable', () => {
      const variableSet = createVariableSet()
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(variableSet))

      return subject.find(variableSet.id).then(actual => {
        expect(actual).to.eql(variableSet)
        return expect(client.get).to.be.calledWith(`/variables/${variableSet.id}`)
      })
    })
  })
})
