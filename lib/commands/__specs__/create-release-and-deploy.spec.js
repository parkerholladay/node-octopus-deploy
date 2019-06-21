'use strict'

const { execute: subject } = require('../create-release-and-deploy')
require('../../../test/init-api')
const { Maybe } = require('../../utils/maybe')
const { generateDeploymentProcess, generateRelease } = require('../../../test/mocks')
const octopus = require('../../octopus-deploy')
const { sandbox } = require('../../../test/sandbox')

describe('commands/create-release-and-deploy', () => {
  const projectId = 'HotS'
  const version = '1.0.0-beta'
  const releaseNotes = 'Prepare for battle'
  const selectedPackages = [{ stepName: `Step 1: Don't die`, version: '1.0.0' }]
  const releaseParams = { projectId, version, releaseNotes, selectedPackages }

  const environmentId = 'hanamura'
  const comments = 'Deliver the payloads'
  const formValues = { Genji: 'When I used to play in the arcade, I thought double jumping was so unrealistic.' }
  const machineIds = ['Payload1', 'Payload2']
  const deployParams = { environmentId, comments, formValues, machineIds }

  let release
  let deployment

  beforeEach(() => {
    release = generateRelease({ projectId, version, releaseNotes, selectedPackages })
    deployment = generateDeploymentProcess({ environmentId, projectId, releaseId: release.id, specificMachineIds: machineIds, comments })

    sandbox.stub(octopus.releases, 'create').callsFake(async () => Maybe.some(release))
    sandbox.stub(octopus.deployments, 'create').callsFake(async () => Maybe.some(deployment))
  })

  it('deploys the release', async () => {
    const actual = await subject(releaseParams, deployParams)

    expect(actual).to.deep.equal(Maybe.some(deployment))
    expect(octopus.releases.create).to.be.calledWith(releaseParams)
    expect(octopus.deployments.create).to.be.calledWith(release.id, deployParams)
  })

  describe('when create release fails', () => {
    it('does not attempt to deploy', async () => {
      release = null

      const actual = await subject(releaseParams, deployParams)

      expect(actual.hasValue).to.be.false
      expect(octopus.deployments.create).to.not.be.called
    })
  })

  describe('when create deploy fails', () => {
    it('returns none', async () => {
      deployment = null

      const actual = await subject(releaseParams, deployParams)

      expect(actual.hasValue).to.be.false
    })
  })
})
