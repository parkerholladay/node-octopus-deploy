'use strict'

const BPromise = require('bluebird')

const octopus = require('../octopus-deploy')
require('../../test/init-api')
const subject = require('../octo-push')
const createPackage = require('../../test/mocks/package')
const sandbox = require('../../test/sandbox')

describe('octo-push', () => {
  let newPackage
  let expected

  const name = 'eternal-conflict'
  const version = '1.0.0-rc4'
  const extension = 'tar.gz'
  const contents = Buffer.from('hots-is-life')
  const fileName = `${name}.${version}.${extension}`
  let publishParams = { name, version, extension, replace: false, contents }

  beforeEach(() => {
    newPackage = createPackage({ id: 'defend-this-keep', packageSizeBytes: 2097152 })
    expected = {
      title: newPackage.title,
      version: newPackage.version,
      extension: newPackage.fileExtension,
      size: '2.00 MB'
    }
    sandbox.stub(octopus.packages, 'create').callsFake(() => BPromise.resolve(newPackage))
  })

  it('creates the package', () => {
    return subject(publishParams).then(actual => {
      expect(octopus.packages.create).to.have.been.calledWith(fileName, false, contents)
      return expect(actual).to.deep.equal(expected)
    })
  })

  describe('when replace is true', () => {
    beforeEach(() => {
      newPackage = Object.assign({}, newPackage, { packageSizeBytes: 720 })
      expected = Object.assign({}, expected, { size: '720 B' })
    })

    it('re-creates the package', () => {
      publishParams = { name, version, extension, replace: true, contents }
      return subject(publishParams).then(actual => {
        expect(octopus.packages.create).to.have.been.calledWith(fileName, true, contents)
        return expect(actual).to.deep.equal(expected)
      })
    })
  })
})
