'use strict'

const { Maybe } = require('../maybe')

describe('utils/maybe', () => {
  describe('#hasValue', () => {
    it('returns true when Maybe is initialized with value', () => {
      expect(new Maybe('ima-string').hasValue).to.be.true
      expect(new Maybe(1).hasValue).to.be.true
      expect(new Maybe({ foo: 'bar' }).hasValue).to.be.true
    })

    it('returns false when Maybe is not initialized with value', () => {
      expect(new Maybe().hasValue).to.be.false
      expect(new Maybe(null).hasValue).to.be.false
    })
  })

  describe('#value', () => {
    it('returns value when exists', () => {
      expect(new Maybe('ima-string').value).to.equal('ima-string')
      expect(new Maybe(1).value).to.equal(1)
      expect(new Maybe({ foo: 'bar' }).value).to.deep.equal({ foo: 'bar' })
    })

    it('throws when Maybe does not have value', () => {
      expect(() => new Maybe().value).to.throw('Maybe does not have a value')
    })
  })

  describe('#some', () => {
    it('initializes Maybe with value', () => {
      expect(Maybe.some({ foo: 'bar' })).to.deep.equal(new Maybe({ foo: 'bar' }))
    })
  })

  describe('#none', () => {
    it('initializes Maybe with no value', () => {
      expect(Maybe.none()).to.deep.equal(new Maybe())
    })
  })

  describe('#valueOrDefault', () => {
    it('returns value when Maybe has vaule', () => {
      const val = { foo: 'bar' }
      const maybe = new Maybe(val)
      expect(maybe.valueOrDefault([])).to.deep.equal(val)
    })

    it('returns supplied default when Maybe does not have value', () => {
      const maybe = new Maybe()
      expect(maybe.valueOrDefault([])).to.deep.equal([])
    })
  })
})
