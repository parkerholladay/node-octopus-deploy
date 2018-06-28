'use strict'

const BPromise = require('bluebird')
const { expect } = require('chai')
const sinon = require('sinon')

const octo = require('../../')
const createProcess = require('../../../test/mocks/deployment-process')
const subject = require('../get-selected-packages').execute

describe('commands/get-selected-packages', () => {
  const process = createProcess()
  const packageVersion = '1.0.0'

  afterEach(() => {
    octo.api.processes.find.restore()
  })

  describe('when the deployment process has steps', () => {
    it('returns packages with versions', () => {
      sinon.stub(octo.api.processes, 'find').callsFake(() => BPromise.resolve(process))
      const expected = [{ stepName: 'Step 1', version: packageVersion }]

      return subject(process.id, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql(expected)
        return expect(octo.api.processes.find).to.be.calledWith(process.id)
      })
    })
  })

  describe('when the deployment process does not have steps', () => {
    it('returns nothing', () => {
      const processWithNoSteps = Object.assign({}, process, { steps: [] })
      sinon.stub(octo.api.processes, 'find').callsFake(() => BPromise.resolve(processWithNoSteps))

      return subject(process.id, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql([])
        return expect(octo.api.processes.find).to.be.calledWith(process.id)
      })
    })
  })
})
