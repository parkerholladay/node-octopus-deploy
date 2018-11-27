'use strict'

const BPromise = require('bluebird')

const subject = require('../create-release-and-deploy').execute
const createDeployment = require('../../../test/mocks/deployment')
require('../../../test/init-api')
const octopus = require('../../octopus-deploy')
const createRelease = require('../../../test/mocks/release')
const sandbox = require('../../../test/sandbox')

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

  it('deploys the release', () => {
    const release = createRelease({ projectId, version, releaseNotes, selectedPackages })
    const deployment = createDeployment({ environmentId, projectId, releaseId: release.id, specificMachineIds: machineIds, comments })
    sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.resolve(release))
    sandbox.stub(octopus.deployments, 'create').callsFake(() => BPromise.resolve(deployment))

    return subject(releaseParams, deployParams).then(actual => {
      expect(octopus.releases.create).to.be.calledWith(releaseParams)
      expect(octopus.deployments.create).to.be.calledWith(release.id, deployParams)
      return expect(actual).to.deep.equal(deployment)
    })
  })

  describe('when create release fails', () => {
    it('does not attempt to deploy', () => {
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.reject('fail release'))
      sandbox.stub(octopus.deployments, 'create').callsFake(() => BPromise.reject('fail deploy'))

      return subject(releaseParams, deployParams).catch(err => {
        expect(octopus.deployments.create).to.not.be.called
        return expect(err).to.equal('fail release')
      })
    })
  })

  describe('when deploy fails', () => {
    it('rejects with an error', () => {
      sandbox.stub(octopus.releases, 'create').callsFake(() => BPromise.resolve(createRelease()))
      sandbox.stub(octopus.deployments, 'create').callsFake(() => BPromise.reject('fail deploy'))

      return expect(subject(releaseParams, deployParams)).to.eventually.be.rejectedWith('fail deploy')
    })
  })
})
