'use strict'

const { expect } = require('chai')

const testConfig = require('../../test/client-config')
const Deployment = require('../api/deployment')
const Environment = require('../api/environment')
const Machine = require('../api/machine')
const subject = require('../octopus-deploy')
const Package = require('../api/package')
const Process = require('../api/process')
const Project = require('../api/project')
const Release = require('../api/release')

describe('octopus-deploy', () => {
  beforeEach(() => {
    subject.close()
  })
  afterEach(() => {
    subject.close()
    subject.init(testConfig)
  })

  describe('#init', () => {
    it('throws an error when already initialized', () => {
      subject.init(testConfig)
      expect(() => subject.init(testConfig)).to.throw('The octopus api client has already been initialized')
    })
  })

  describe('#get *', () => {
    describe('when client is not initialized', () => {
      it('throws errors', () => {
        expect(() => subject.deployments).to.throw(`The configuration for the api must be set by calling 'init' before making requests`)
        expect(() => subject.environments).to.throw
        expect(() => subject.machines).to.throw
        expect(() => subject.packages).to.throw
        expect(() => subject.processes).to.throw
        expect(() => subject.projects).to.throw
        expect(() => subject.releases).to.throw
      })
    })

    describe('when initialized', () => {
      it('returns api', () => {
        subject.init(testConfig)
        expect(subject.deployments).to.be.instanceOf(Deployment)
        expect(subject.environments).to.be.instanceOf(Environment)
        expect(subject.machines).to.be.instanceOf(Machine)
        expect(subject.packages).to.be.instanceOf(Package)
        expect(subject.processes).to.be.instanceOf(Process)
        expect(subject.projects).to.be.instanceOf(Project)
        expect(subject.releases).to.be.instanceOf(Release)
      })
    })
  })
})
