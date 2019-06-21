'use strict'

const { Maybe } = require('../../utils/maybe')
const { generateDeploymentProcess } = require('../../../test/mocks')
const OctopusClient = require('../../utils/octopus-client')
const Process = require('../process')
const { sandbox } = require('../../../test/sandbox')

const client = new OctopusClient(require('../../../test/client-config'))
const subject = new Process(client)

describe('api/process', () => {
  describe('#find', () => {
    let process

    beforeEach(() => {
      process = generateDeploymentProcess({ id: 'collect-my-gems' })
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(process))
    })

    it('finds a deployment process', async () => {
      const actual = await subject.find(process.id)
      expect(actual.value).to.deep.equal(process)
      expect(client.get).to.be.calledWith(`/deploymentProcesses/${process.id}`)
    })

    describe('when deployment process does not exist', () => {
      it('returns none', async () => {
        process = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
