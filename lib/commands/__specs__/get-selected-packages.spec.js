'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const subject = require('../get-selected-packages').execute
const mockProcess = require('../../../test/mocks/mock-deployment-process')
const octopusApi = require('../../octopus-deploy')

describe('commands/get-selected-packages', () => {
  const deploymentProcessId = 'process-123'
  const packageVersion = '1.0.0'

  afterEach(() => {
    octopusApi.processes.find.restore()
  })

  describe('when the deployment process has steps', () => {
    it('returns packages with versions', () => {
      sinon.stub(octopusApi.processes, 'find').callsFake(() => BPromise.resolve(mockProcess))
      const expected = [{ StepName: 'Step 1', Version: packageVersion }]

      return subject(deploymentProcessId, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql(expected)
        expect(octopusApi.processes.find).to.be.calledWith(deploymentProcessId)
      })
    })
  })

  describe('when the deployment process does not have steps', () => {
    it('returns nothing', () => {
      const processWithNoSteps = Object.assign({}, mockProcess, { Steps: [] })
      sinon.stub(octopusApi.processes, 'find').callsFake(() => BPromise.resolve(processWithNoSteps))

      return subject(deploymentProcessId, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql([])
        expect(octopusApi.processes.find).to.be.calledWith(deploymentProcessId)
      })
    })
  })
})
