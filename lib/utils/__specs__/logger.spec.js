'use strict'
/* eslint-disable no-console */

const subject = require('../logger')
const sandbox = require('../../../test/sandbox')

describe('logger', () => {
  beforeEach(() => {
    sandbox.stub(console, 'log')
    sandbox.stub(console, 'error')
  })
  afterEach(() => {
    global.logToConsoleDisabled = true
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
