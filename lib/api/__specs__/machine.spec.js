'use strict'

const BPromise = require('bluebird')

const Machine = require('../machine')
const createMachine = require('../../../test/mocks/machine')
const OctopusClient = require('../../utils/octopus-client')
const createTask = require('../../../test/mocks/task')
const sandbox = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Machine(client)

describe('api/machine', () => {
  describe('#findAll', () => {
    it('finds all machines', () => {
      const machines = [
        createMachine({ id: 'probius' }),
        createMachine({ id: 'genji' }),
        createMachine({ id: 'd.va' })
      ]
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(machines))

      return subject.findAll().then(actual => {
        expect(client.get).to.be.calledWith(`/machines/all`)
        return expect(actual).to.deep.equal(machines)
      })
    })
  })

  describe('#delete', () => {
    it('deletes a machine', () => {
      const machineId = 'sgt-hammer'
      const expected = createTask({ name: 'hammer-go-boom' })

      sandbox.stub(client, 'delete').callsFake(() => BPromise.resolve(expected))

      return subject.delete(machineId).then(actual => {
        expect(client.delete).to.be.calledWith(`/machines/${machineId}`)
        return expect(actual).to.deep.equal(expected)
      })
    })
  })
})
