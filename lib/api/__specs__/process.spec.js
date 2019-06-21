'use strict'

const BPromise = require('bluebird')

const { generateDeploymentProcess } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const Process = require('../process')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Process(client)

describe('api/process', () => {
  describe('#find', () => {
    it('finds a deployment process', () => {
      const process = generateDeploymentProcess({ id: 'collect-my-gems' })
      sandbox.stub(client, 'get').callsFake(() => BPromise.resolve(process))

      return subject.find(process.id).then(actual => {
        expect(client.get).to.be.calledWith(`/deploymentProcesses/${process.id}`)
        return expect(actual).to.deep.equal(process)
      })
    })
  })
})
