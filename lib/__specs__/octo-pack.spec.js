'use strict'

const archiver = require('archiver')
const { Readable } = require('stream')

const gs = require('../utils/glob-wrapper')
const subject = require('../octo-pack')
const sandbox = require('../../test/sandbox')

describe('octo-pack', () => {
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

    const done = subject(globs).then(actual => {
      expect(actual).to.eql(expected)
      expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
      expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
      expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
      return expect(archive.finalize).to.have.been.called
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

      const done = subject(globs, { zip: true }).then(actual => {
        expect(actual).to.eql(expected)
        expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
        expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
        expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
        return expect(archive.finalize).to.have.been.called
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

      const done = subject(globs, { base }).then(actual => {
        expect(actual).to.eql(expected)
        expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
        expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
        expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
        return expect(archive.finalize).to.have.been.called
      })

      globStream.emit('data', { path: filePath, cwd: fileCwd, base: fileBase })
      globStream.emit('end')

      return done
    })
  })

  describe('when no files are found', () => {
    it('throws an error', () => {
      const done = subject(globs).catch(err => {
        expect(err).to.not.be.null
        expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
        expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
        expect(archive.file).to.not.have.been.called
        return expect(archive.finalize).to.not.have.been.called
      })

      globStream.emit('end')

      return done
    })
  })

  describe('when archiver emits an error', () => {
    it('throws the error', () => {
      const error = new Error('Even death can not impede justice')

      const done = subject(globs).catch(err => {
        return expect(err).to.eql(error)
      })

      archive.emit('error', error)

      return done
    })
  })
})
