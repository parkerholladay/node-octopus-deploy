'use strict'
/* eslint-disable no-console */

const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../logger')

describe('logger', () => {
  beforeEach(() => {
    sinon.spy(console, 'log')
  })
  afterEach(() => {
    console.log.restore()
  })

  describe('when logging is disabled', () => {
    it('does not log to console', () => {
      global.logToConsoleDisabled = true
      subject.info('foo')
      expect(console.log).to.not.be.called
    })
  })
})

/* eslint-enable no-console */
