'use strict'

function create(overrides) {
  return Object.assign({},
    {
      id: 'Releases-123',
      assembled: '2017-01-01T00:00:00+0000',
      channelId: 'Channels-123',
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      libraryVariableSetSnapshotIds: [],
      links: {},
      projectDeploymentProcessSnapshotId: 'DeploymentProcess-Projects-123-snapshot-1',
      projectId: 'Projects-123',
      projectVariableSetSnapshotId: 'Variableset-Projects-123-snapshot-1',
      releaseNotes: 'Release Notes Here - Testing Through REST API',
      selectedPackages: [],
      version: '1.0.0-rc-3'
    },
    overrides
  )
}

module.exports = create
