'use strict'

const testConfig = require('../../test/client-config')
const Deployment = require('../api/deployment')
const Environment = require('../api/environment')
const Machine = require('../api/machine')
const subject = require('../octopus-deploy')
const Package = require('../api/package')
const Process = require('../api/process')
const Project = require('../api/project')
const Release = require('../api/release')
const Variable = require('../api/variable')

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
      const expectedError = `The configuration for the api must be set by calling 'init' before making requests`

      it('throws errors', () => {
        expect(() => subject.deployments).to.throw(expectedError)
        expect(() => subject.environments).to.throw(expectedError)
        expect(() => subject.machines).to.throw(expectedError)
        expect(() => subject.packages).to.throw(expectedError)
        expect(() => subject.processes).to.throw(expectedError)
        expect(() => subject.projects).to.throw(expectedError)
        expect(() => subject.releases).to.throw(expectedError)
        expect(() => subject.variables).to.throw(expectedError)
      })
    })

    describe('when initialized', () => {
      beforeEach(() => {
        subject.init(testConfig)
      })

      it('returns api', () => {
        expect(subject.deployments).to.be.instanceOf(Deployment)
        expect(subject.environments).to.be.instanceOf(Environment)
        expect(subject.machines).to.be.instanceOf(Machine)
        expect(subject.packages).to.be.instanceOf(Package)
        expect(subject.processes).to.be.instanceOf(Process)
        expect(subject.projects).to.be.instanceOf(Project)
        expect(subject.releases).to.be.instanceOf(Release)
        expect(subject.variables).to.be.instanceOf(Variable)
      })
    })
  })
})
