'use strict'

const archiver = require('archiver')
const { expect } = require('chai')
const sinon = require('sinon')
const { Readable } = require('stream')

const gs = require('../utils/glob-wrapper')
const subject = require('../octo-pack')

describe('octo-pack', () => {
  let globs
  const globOptions = { nodir: true }
  let globStream
  let archiveType
  let archiveOptions
  let archive
  let archiveFileStub
  let archiveFinalizeStub

  beforeEach(() => {
    globs = ['./lib/**', '!**__specs__/**']
    globStream = new Readable({ read: () => true })
    sinon.stub(gs, 'getGlobStream').returns(globStream)

    archiveType = 'tar'
    archiveOptions = { gzip: true }

    archive = new Readable({ read: () => true })
    archiveFileStub = sinon.stub()
    archiveFinalizeStub = sinon.stub()
    archive.file = archiveFileStub
    archive.finalize = archiveFinalizeStub
    sinon.stub(archiver, 'create').returns(archive)
  })

  afterEach(() => {
    gs.getGlobStream.restore()
    archiver.create.restore()
  })

  it('adds files from glob to archive stream', () => {
    const filePath = 'embrace/justice/tyrael.hots'
    const fileBase = 'embrace/justice'
    const fileName = 'tyrael.hots'

    const result = subject(globs)
    globStream.emit('data', { path: filePath, base: fileBase })
    globStream.emit('end')

    expect(result).to.eql(archive)
    expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
    expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
    expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
    expect(archive.finalize).to.have.been.called
  })

  describe('when archive type is zip', () => {
    it('adds files from glob to archive stream', () => {
      archiveType = 'zip'
      archiveOptions = { zlib: { level: 9 } }
      const filePath = 'bestow/hope/auriel.hots'
      const fileBase = 'bestow/hope'
      const fileName = 'auriel.hots'

      const result = subject(globs, { zip: true })
      globStream.emit('data', { path: filePath, base: fileBase })
      globStream.emit('end')

      expect(result).to.eql(archive)
      expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
      expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
      expect(archive.file).to.have.been.calledWith(filePath, { name: fileName })
      expect(archive.finalize).to.have.been.called
    })
  })

  describe('when no files are found', () => {
    it('does not finalize the archive', () => {
      subject(globs)
      globStream.emit('end')

      expect(gs.getGlobStream).to.have.been.calledWith(globs, globOptions)
      expect(archiver.create).to.have.been.calledWith(archiveType, archiveOptions)
      expect(archive.file).to.not.have.been.called
      expect(archive.finalize).to.not.have.been.called
    })
  })

  describe('when archiver emits an error', () => {
    it('thwos the error', () => {
      const error = new Error('Even death can not impede justice')
      try {
        subject(globs)
        archive.emit('err', error)
      } catch (err) {
        expect(err).to.eql(error)
      }
    })
  })
})
