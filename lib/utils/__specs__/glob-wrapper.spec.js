'use strict'

const path = require('path')

const gs = require('../glob-wrapper')

describe('utils/glob-wrapper', () => {
  describe('#getGlobStream', () => {
    const subject = gs.getGlobStream
    it('returns a readable stream', done => {
      const globStream = subject(path.resolve(__dirname, './*'), { nodir: true })
      const files = []

      globStream.on('data', file => files.push(file.path))
      globStream.on('end', () => {
        expect(files.length).to.be.greaterThan(0)
        done()
      })

      globStream.read()
    })
  })
})
