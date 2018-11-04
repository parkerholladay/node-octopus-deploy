'use strict'

const BPromise = require('bluebird')

const createProcess = require('../../../test/mocks/deployment-process')
const OctopusClient = require('../../utils/octopus-client')
const Process = require('../process')
const sandbox = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Process(client)

describe('api/process', () => {
  describe('#find', () => {
    it('finds a deployment process', () => {
      const process = createProcess({ id: 'collect-my-gems' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(process))

      return subject.find(process.id).then(actual => {
        expect(actual).to.eql(process)
        return expect(client.get).to.be.calledWith(`/deploymentProcesses/${process.id}`)
      })
    })
  })
})
