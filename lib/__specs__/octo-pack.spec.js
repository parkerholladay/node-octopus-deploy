'use strict'

const archiver = require('archiver')
const BPromise = require('bluebird')
const { Readable } = require('stream')

const gs = require('../utils/glob-wrapper')
require('../../test/init-api')
const { generatePackage } = require('../../test/mocks')
const octopus = require('../octopus-deploy')
const { octopack, publish } = require('../octo-pack')
const { sandbox } = require('../../test/sandbox')

describe('octo-pack', () => {
  describe('#octopack', () => {
    let globs
    let globOptions
    let globStream
    let archiveType
    let archiveOptions
    let archive
    let archiveFileStub
    let archiveFinalizeStub
    let expected
    let expectedBuffers = []

    beforeEach(() => {
      globs = ['./lib/**', '!**__specs__/**']
      globOptions = { nodir: true }
      globStream = new Readable({ read: () => true })
      sandbox.stub(gs, 'getGlobStream').returns(globStream)

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
      sandbox.stub(archiver, 'create').returns(archive)
    })

    it('adds files from glob to archive stream', () => {
      const filePath = 'embrace/justice/tyrael.hots'
      const fileCwd = 'embrace'
      const fileBase = 'justice/'
      const fileName = 'tyrael.hots'

      const done = octopack(globs).then(actual => {
        expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
        expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
        expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
        expect(archive.finalize).to.have.been.called
        return expect(actual).to.deep.equal(expected)
      })

      globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
      globStream.emit('end')

      return done
    })

    describe('when archive type is zip', () => {
      it('adds files from glob to archive stream', () => {
        archiveType = 'zip'
        archiveOptions = { zlib: { level: 9 } }
        const filePath = 'bestow/hope/auriel.hots'
        const fileCwd = 'bestow'
        const fileBase = 'hope/'
        const fileName = 'auriel.hots'

        const done = octopack(globs, { zip: true }).then(actual => {
          expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
          expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
          expect(archive.finalize).to.have.been.called
          return expect(actual).to.deep.equal(expected)
        })

        globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
        globStream.emit('end')

        return done
      })
    })

    describe('when base is provided', () => {
      it('uses base in globOptions', () => {
        const base = './'
        globOptions = Object.assign({}, globOptions, { base })
        const filePath = 'witch/doctor/nazeebo.hots'
        const fileCwd = 'witch'
        const fileBase = 'doctor/'
        const fileName = 'nazeebo.hots'

        const done = octopack(globs, { base }).then(actual => {
          expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
          expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
          expect(archive.finalize).to.have.been.called
          return expect(actual).to.deep.equal(expected)
        })

        globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
        globStream.emit('end')

        return done
      })
    })

    describe('when no files are found', () => {
      it('throws an error', () => {
        const done = octopack(globs).catch(err => {
          expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
          expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
          expect(archive.file).to.not.have.been.called
          expect(archive.finalize).to.not.have.been.called
          return expect(err).to.not.be.null
        })

        globStream.emit('end')

        return done
      })
    })

    describe('when archiver emits an error', () => {
      it('throws the error', () => {
        const error = new Error('Even death can not impede justice')

        const done = expect(octopack(globs)).to.eventually.be.rejectedWith(error)

        archive.emit('error', error)

        return done
      })
    })
  })

  describe('#publish', () => {
    let newPackage
    let expected

    const name = 'eternal-conflict'
    const version = '1.0.0-rc4'
    const extension = 'tar.gz'
    const contents = Buffer.from('hots-is-life')
    const fileName = `${name}.${version}.${extension}`
    let publishParams = { name, version, extension, replace: false, contents }

    beforeEach(() => {
      newPackage = generatePackage({ id: 'defend-this-keep', packageSizeBytes: 2097152 })
      expected = {
        title: newPackage.title,
        version: newPackage.version,
        extension: newPackage.fileExtension,
        size: '2.00 MB'
      }
      sandbox.stub(octopus.packages, 'create').callsFake(() => BPromise.resolve(newPackage))
    })

    it('creates the package', () => {
      return publish(publishParams).then(actual => {
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
        return publish(publishParams).then(actual => {
          expect(octopus.packages.create).to.have.been.calledWith(fileName, true, contents)
          return expect(actual).to.deep.equal(expected)
        })
      })
    })
  })
})
