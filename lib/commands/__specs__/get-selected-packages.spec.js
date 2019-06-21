'use strict'

const BPromise = require('bluebird')

const { execute: subject } = require('../get-selected-packages')
require('../../../test/init-api')
const { generateDeploymentProcess } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')

describe('commands/get-selected-packages', () => {
  describe('#execute', () => {
    const deploymentProcess = generateDeploymentProcess()
    const packageVersion = '1.0.0'

    let processesResult

    beforeEach(() => {
      processesResult = BPromise.resolve(deploymentProcess)
      sandbox.stub(octopus.processes, 'find').callsFake(() => processesResult)
    })

    describe('when the deployment process has steps', () => {
      it('returns packages with versions', () => {
        const selectedPackages = [{ stepName: 'Step 1', version: packageVersion }]

        return expect(subject(deploymentProcess.id, packageVersion)).to.eventually.deep.equal(selectedPackages)
      })
    })

    describe('when the deployment process does not have steps', () => {
      it('returns nothing', () => {
        const processWithNoSteps = Object.assign({}, deploymentProcess, { steps: [] })
        processesResult = BPromise.resolve(processWithNoSteps)

        return expect(subject(deploymentProcess.id, packageVersion)).to.eventually.deep.equal([])
      })
    })
  })
})
