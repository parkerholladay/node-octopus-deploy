'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const Machine = require('../machine')
const mockMachine = require('../../../test/mocks/mock-machine')
const mockMachineDelete = require('../../../test/mocks/mock-machine-delete')
const OctopusClient = require('../../octopus-client')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Machine(client)

describe('api/machine', () => {
  describe('#delete', () => {
    afterEach(() => {
      client.delete.restore()
    })

    it('deletes a machine', () => {
      const machineId = 'Machines-1151'

      sinon.stub(client, 'delete').callsFake(() => BPromise.resolve(mockMachineDelete))

      return subject.delete(machineId).then(machineDelete => {
        expect(machineDelete).to.eql(mockMachineDelete)
        return expect(client.delete).to.be.calledWith(`/machines/${machineId}`)
      })
    })
  })

  describe('#findAll', () => {
    afterEach(() => {
      client.get.restore()
    })

    it('finds all machines', () => {
      sinon.stub(client, 'get').callsFake(() => BPromise.resolve([mockMachine, mockMachine, mockMachine]))

      return subject.findAll().then(machines => {
        expect(machines).to.eql([mockMachine, mockMachine, mockMachine])
        return expect(client.get).to.be.calledWith(`/machines/all`)
      })
    })
  })
})
