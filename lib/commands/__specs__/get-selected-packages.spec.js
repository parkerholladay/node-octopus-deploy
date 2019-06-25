'use strict'

const { execute: subject } = require('../get-selected-packages')
require('../../../test/init-api')
const { generateDeploymentProcess } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')
const { Maybe } = require('../../utils')

describe('commands/get-selected-packages', () => {
  describe('#execute', () => {
    const packageVersion = '1.0.0'

    let deploymentProcess

    beforeEach(() => {
      deploymentProcess = generateDeploymentProcess()
      sandbox.stub(octopus.processes, 'find').callsFake(async () => Maybe.some(deploymentProcess))
    })

    describe('when the deployment process has steps', () => {
      it('returns packages with versions', async () => {
        const expected = [{ stepName: 'Step 1', version: packageVersion }]
        const actual = await subject(deploymentProcess.id, packageVersion)
        expect(actual).to.deep.equal(expected)
      })
    })

    describe('when the deployment process does not have steps', () => {
      it('returns empty packages', async () => {
        deploymentProcess = { ...deploymentProcess, steps: [] }
        const actual = await subject(deploymentProcess.id, packageVersion)
        expect(actual).to.deep.equal([])
      })
    })

    describe('when the deployment process does not exist', () => {
      it('returns empty packages', async () => {
        deploymentProcess = null
        const actual = await subject('does-not-exist', packageVersion)
        expect(actual).to.deep.equal([])
      })
    })
  })
})
