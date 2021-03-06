'use strict'

const archiver = require('archiver')
const { Readable } = require('stream')

const api = require('../../api')
require('../../../test/init-api')
const { generatePackage } = require('../../../test/mocks')
const { octopack, publish } = require('../octo-pack')
const { sandbox } = require('../../../test/sandbox')
const { logger, Maybe } = require('../../utils')
const utils = require('../../utils')

describe('octo-pack', () => {
  describe('#octopack', () => {
    const globs = ['./lib/**', '!**__specs__/**']
    const globStream = new Readable({ read: () => true })

    const filePath = 'embrace/justice/tyrael.hots'
    const fileCwd = 'embrace'
    const fileBase = 'justice/'
    const fileName = 'tyrael.hots'

    let globOptions
    let archiveType
    let archiveOptions
    let archive
    let archiveFileStub
    let archiveFinalizeStub
    let expected
    const expectedBuffers = []

    beforeEach(() => {
      globOptions = { nodir: true }

      archiveType = 'tar'
      archiveOptions = { gzip: true }

      archive = new Readable({ read: () => true })
      archiveFileStub = sandbox.stub().callsFake(() => {
        const buffer = Buffer.from('hots-is-life')
        archive.emit('data', buffer)
        expectedBuffers.push(buffer)
        expected = Buffer.concat(expectedBuffers)
      })
      archiveFinalizeStub = sandbox.stub().callsFake(() => archive.emit('end'))
      archive.file = archiveFileStub
      archive.finalize = archiveFinalizeStub

      sandbox.stub(utils, 'getGlobStream').returns(globStream)
      sandbox.stub(archiver, 'create').returns(archive)
      sandbox.stub(logger, 'info')
      sandbox.stub(logger, 'error')
    })

    it('adds files from glob to archive stream', async () => {
      const done = octopack(globs).then(actual => {
        expect(utils.getGlobStream).to.be.calledWith(globs, globOptions)
        expect(archiver.create).to.be.calledWith(archiveType, archiveOptions)
        expect(archive.file).to.be.calledWith(filePath, { name: fileName })
        expect(archive.finalize).to.be.called
        return expect(actual.value).to.deep.equal(expected)
      })

      globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
      globStream.emit('end')

      return done
    })

    describe('when archive type is zip', () => {
      it('adds files from glob to archive stream', () => {
        archiveType = 'zip'
        archiveOptions = { zlib: { level: 9 } }

        const done = octopack(globs, { zip: true }).then(actual => {
          expect(utils.getGlobStream).to.be.calledWith(globs, globOptions)
          expect(archiver.create).to.be.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.be.calledWith(filePath, { name: fileName })
          expect(archive.finalize).to.be.called
          return expect(actual.value).to.deep.equal(expected)
        })

        globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
        globStream.emit('end')

        return done
      })
    })

    describe('when base is provided', () => {
      it('uses base in globOptions', () => {
        const base = './'
        globOptions = { ...globOptions, base }

        const done = octopack(globs, { base }).then(actual => {
          expect(utils.getGlobStream).to.be.calledWith(globs, globOptions)
          expect(archiver.create).to.be.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.be.calledWith(filePath, { name: fileName })
          expect(archive.finalize).to.be.called
          return expect(actual.value).to.deep.equal(expected)
        })

        globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
        globStream.emit('end')

        return done
      })
    })

    describe('when no files are found', () => {
      it('returns none', () => {
        const done = octopack(globs).then(actual => {
          expect(utils.getGlobStream).to.be.calledWith(globs, globOptions)
          expect(archiver.create).to.be.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.not.be.called
          expect(archive.finalize).to.not.be.called
          expect(logger.error).to.be.called
          return expect(actual.hasValue).to.be.false
        })

        globStream.emit('end')

        return done
      })
    })

    describe('when archiver emits an error', () => {
      it('returns none', () => {
        const error = new Error('Even death can not impede justice')

        const done = octopack(globs).then(actual => {
          expect(logger.error).to.be.calledWith('Failed to create package. Error:', error)
          return expect(actual.hasValue).to.be.false
        })

        archive.emit('error', error)

        return done
      })
    })

    describe('when archiver emits a warning', () => {
      it('logs the warning', () => {
        const error = new Error('Even death can not impede justice')

        const done = octopack(globs).then(() => {
          return expect(logger.error).to.be.calledWith('Warning building archive', error)
        })

        globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
        archive.emit('warning', error)
        globStream.emit('end')

        return done
      })
    })
  })

  describe('#publish', () => {
    const name = 'eternal-conflict'
    const version = '1.0.0-rc4'
    const extension = 'tar.gz'
    const contents = Buffer.from('hots-is-life')
    const fileName = `${name}.${version}.${extension}`

    let publishParams
    let newPackage
    let expected

    beforeEach(() => {
      publishParams = { name, version, extension, replace: false, contents }
      newPackage = generatePackage({ id: 'defend-this-keep', packageSizeBytes: 2097152 })
      expected = {
        title: newPackage.title,
        version: newPackage.version,
        extension: newPackage.fileExtension,
        size: '2.00 MB'
      }

      sandbox.stub(api.packages, 'create').callsFake(async () => Maybe.some(newPackage))
    })

    it('creates the package', async () => {
      const actual = await publish(publishParams)
      expect(actual.value).to.deep.equal(expected)
      expect(api.packages.create).to.be.calledWith(fileName, contents, false)
    })

    describe('when replace is true', () => {
      it('re-creates the package', async () => {
        publishParams = { ...publishParams, replace: true }
        newPackage = { ...newPackage, packageSizeBytes: 720 }
        expected = { ...expected, size: '720 B' }

        const actual = await publish(publishParams)

        expect(actual.value).to.deep.equal(expected)
        expect(api.packages.create).to.be.calledWith(fileName, contents, true)
      })
    })

    describe('when create package fails', () => {
      it('returns none', async () => {
        newPackage = null
        const actual = await publish(publishParams)
        expect(actual.hasValue).to.be.false
      })
    })
  })
})
