'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const mockVariable = require('../../../test/mocks/mock-variable')
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
      const variableId = 'variables-123'
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve(mockVariable))

      return subject.find(variableId).then(variable => {
        expect(variable).to.eql(mockVariable)
        expect(client.get).to.be.calledWith(`/variables/${variableId}`)
      })
    })
  })
})
