'use strict'

const subject = require('../channel')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateChannel, generateSearchChannel } = require('../../../test/mocks')
const client = require('../../octopus-client')
const { sandbox } = require('../../../test/sandbox')

describe('api/channel', () => {
  let channel
  let channels

  beforeEach(() => {
    channel = generateChannel({ id: 'tassadar-123' })
    channels = generateSearchChannel([channel])
  })

  describe('#getAll', () => {
    beforeEach(() => {
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(channels))
    })

    it('finds all channels', async () => {
      const actual = await subject.getAll()
      expect(actual.value).to.deep.equal(channels)
    })

    it('respects pagination args', async () => {
      const take = 1
      const skip = 1
      const expectedUrl = `/channels?take=${take}&skip=${skip}`

      await subject.getAll(1, 1)

      expect(client.get).to.have.been.calledWith(expectedUrl)
    })
  })
})
