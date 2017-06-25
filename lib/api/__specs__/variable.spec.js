'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const createVariableSet = require('../../../test/mocks/variable-set')
const OctopusClient = require('../../octopus-client')
const Variable = require('../variable')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Variable(client)

describe('api/variable', () => {
  afterEach(() => {
    client.get.restore()
  })

  describe('#find', () => {
    it('should find a variable', () => {
      const variableSet = createVariableSet()
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(variableSet))

      return subject.find(variableSet.id).then(actual => {
        expect(actual).to.eql(variableSet)
        return expect(client.get).to.be.calledWith(`/variables/${variableSet.id}`)
      })
    })
  })
})
