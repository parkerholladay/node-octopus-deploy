'use strict'
/* eslint-disable no-console */

const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../logger')

describe('logger', () => {
  beforeEach(() => {
    sinon.stub(console, 'log')
    sinon.stub(console, 'error')
  })
  afterEach(() => {
    global.logToConsoleDisabled = true
    console.log.restore()
    console.error.restore()
  })

  describe('when logging is enabled', () => {
    beforeEach(() => {
      global.logToConsoleDisabled = false
    })

    it('logs info to console', () => {
      subject.info('foo')
      expect(console.log).to.be.called
    })

    it('logs errors to console', () => {
      subject.error('foo')
      expect(console.error).to.be.called
    })
  })

  describe('when logging is disabled', () => {
    beforeEach(() => {
      global.logToConsoleDisabled = true
    })

    it('does not log info to console', () => {
      subject.info('foo')
      expect(console.log).to.not.be.called
    })

    it('logs errors to console', () => {
      subject.error('foo')
      expect(console.error).to.be.called
    })
  })
})

/* eslint-enable no-console */
