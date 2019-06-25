'use strict'

require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateDeploymentProcess } = require('../../../test/mocks')
const client = require('../../octopus-client')
const subject = require('../process')
const { sandbox } = require('../../../test/sandbox')

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
