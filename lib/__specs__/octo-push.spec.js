'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')

const octopus = require('../octopus-deploy')
require('../../test/init-api')
const subject = require('../octo-push')
const createPackage = require('../../test/mocks/package')
const sandbox = require('../../test/sandbox')

describe('octo-push', () => {
  const expected = createPackage({ id: 'defend-this-keep' })

  const name = 'eternal-conflict'
  const version = '1.0.0-rc4'
  const extension = 'tar.gz'
  const contents = Buffer.from('hots-is-life')
  const fileName = `${name}.${version}.${extension}`
  let publishParams = { name, version, extension, replace: false, contents }

  beforeEach(() => {
    sandbox.stub(octopus.packages, 'create').callsFake(() => BPromise.resolve(expected))
  })

  it('creates the package', () => {
    return subject(publishParams).then(actual => {
      expect(actual).to.eql(expected)
      return expect(octopus.packages.create).to.have.been.calledWith(fileName, false, contents)
    })
  })

  describe('when replace is true', () => {
    it('re-creates the package', () => {
      publishParams = { name, version, extension, replace: true, contents }
      return subject(publishParams).then(actual => {
        expect(actual).to.eql(expected)
        return expect(octopus.packages.create).to.have.been.calledWith(fileName, true, contents)
      })
    })
  })
})
