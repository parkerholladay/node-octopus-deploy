'use strict'

const BPromise = require('bluebird')

const createProcess = require('../../../test/mocks/deployment-process')
const subject = require('../get-selected-packages').execute
require('../../../test/init-api')
const octopus = require('../../octopus-deploy')
const sandbox = require('../../../test/sandbox')

describe('commands/get-selected-packages', () => {
  const process = createProcess()
  const packageVersion = '1.0.0'

  describe('when the deployment process has steps', () => {
    it('returns packages with versions', () => {
      sandbox.stub(octopus.processes, 'find').callsFake(() => BPromise.resolve(process))
      const expected = [{ stepName: 'Step 1', version: packageVersion }]

      return subject(process.id, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql(expected)
        return expect(octopus.processes.find).to.be.calledWith(process.id)
      })
    })
  })

  describe('when the deployment process does not have steps', () => {
    it('returns nothing', () => {
      const processWithNoSteps = Object.assign({}, process, { steps: [] })
      sandbox.stub(octopus.processes, 'find').callsFake(() => BPromise.resolve(processWithNoSteps))

      return subject(process.id, packageVersion).then(selectedPackages => {
        expect(selectedPackages).to.eql([])
        return expect(octopus.processes.find).to.be.calledWith(process.id)
      })
    })
  })
})
