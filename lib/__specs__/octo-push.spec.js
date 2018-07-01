'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')
const { Readable } = require('stream')

const octopus = require('../octopus-deploy')
require('../../test/init-api')
const subject = require('../octo-push')
const createPackage = require('../../test/mocks/package')

describe('octo-push', () => {
  const expected = createPackage({ id: 'defend-this-keep' })

  const name = 'eternal-conflict'
  const version = '1.0.0-rc4'
  const extension = 'tar.gz'
  const stream = new Readable({ read: () => true })
  const pushParams = { name, version, extension, stream }

  const fileName = `${name}.${version}.${extension}`

  afterEach(() => {
    octopus.packages.create.restore()
  })

  it('creates the package', () => {
    sinon.stub(octopus.packages, 'create').callsFake(() => BPromise.resolve(expected))

    return subject(pushParams).then(actual => {
      expect(actual).to.eql(expected)
      return expect(octopus.packages.create).to.have.been.calledWith(fileName, stream)
    })
  })
})
