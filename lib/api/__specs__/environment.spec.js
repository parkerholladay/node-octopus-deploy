'use strict'

const subject = require('../environment')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateEnvironment } = require('../../../test/mocks')
const client = require('../../octopus-client')
const { sandbox } = require('../../../test/sandbox')

describe('api/environment', () => {
  let environment

  beforeEach(() => {
    environment = generateEnvironment({ id: 'infernal-shrines' })
  })

  describe('#find', () => {
    beforeEach(() => {
      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(environment))
    })

    it('finds an environment', async () => {
      const actual = await subject.find(environment.id)
      expect(actual.value).to.deep.equal(environment)
      expect(client.get).to.be.calledWith(`/environments/${environment.id}`)
    })

    describe('when environment does not exist', () => {
      it('returns none', async () => {
        environment = null
        const actual = await subject.find('does-not-exist')
        expect(actual.hasValue).to.be.false
      })
    })
  })

  describe('#findAll', () => {
    let environments

    beforeEach(() => {
      environments = [
        generateEnvironment({ id: 'haunted-mines' }),
        generateEnvironment({ id: 'towers-of-doom' }),
        generateEnvironment({ id: 'cursed-hollow' })
      ]

      sandbox.stub(client, 'get').callsFake(async () => Maybe.some(environments))
    })

    it('finds all environments', async () => {
      const actual = await subject.findAll()
      expect(actual).to.deep.equal(environments)
      expect(client.get).to.be.calledWith(`/environments/all`)
    })
  })
})
