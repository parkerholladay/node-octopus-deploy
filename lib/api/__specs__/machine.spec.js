'use strict'

const Machine = require('../machine')
const { Maybe } = require('../../utils/maybe')
const { generateMachine, generateTask } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Machine(client)

describe('api/machine', () => {
  let machineId
  let machines

  beforeEach(() => {
    machineId = 'sgt-hammer'
    machines = [
      generateMachine({ id: machineId }),
      generateMachine({ id: 'probius' }),
      generateMachine({ id: 'd.va' })
    ]
  })

  describe('#findAll', () => {
    beforeEach(() => {
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(machines))
    })

    it('finds all machines', async () => {
      const actual = await subject.findAll()
      expect(actual).to.deep.equal(machines)
      expect(client.get).to.be.calledWith(`/machines/all`)
    })
  })

  describe('#delete', () => {
    let deleteTask

    beforeEach(() => {
      deleteTask = generateTask({ name: 'hammer-go-boom' })
      sandbox.stub(client, 'delete').callsFake(async () => Maybe.some(deleteTask))
    })

    it('returns delete task', async () => {
      const actual = await subject.delete(machineId)
      expect(actual.value).to.deep.equal(deleteTask)
      expect(client.delete).to.be.calledWith(`/machines/${machineId}`)
    })

    describe('when delete fails', () => {
      it('returns none', async () => {
        deleteTask = null

        const actual = await subject.delete(machineId)

        expect(actual.hasValue).to.be.false
        expect(client.delete).to.be.calledWith(`/machines/${machineId}`)
      })
    })
  })
})
