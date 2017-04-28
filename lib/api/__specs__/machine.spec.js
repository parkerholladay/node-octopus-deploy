'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const Machine = require('../machine')
const mockMachine = require('../../../test/mocks/mock-machine')
const OctopusClient = require('../../octopus-client')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Machine(client)

describe('api/machine', () => {
  afterEach(() => {
    client.get.restore()
  })

  describe('#findAll', () => {
    it('finds all machines', () => {
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve([mockMachine, mockMachine, mockMachine]))

      return subject.findAll().then(machines => {
        expect(machines).to.eql([mockMachine, mockMachine, mockMachine])
        expect(client.get).to.be.calledWith(`/machines/all`)
      })
    })
  })
})
