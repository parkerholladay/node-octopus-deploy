'use strict'

const generateAction = (overrides = {}) => ({
  id: 'Actions-123',
  actionType: '',
  channels: ['Channels-123'],
  environments: ['Environments-123'],
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  links: {},
  name: 'Step 1',
  properties: {},
  tenantTags: [],
  ...overrides
})

const generateStep = (overrides = {}) => ({
  id: 'Steps-123',
  condition: '',
  name: 'Step 1',
  properties: {},
  requiresPackagesToBeAcquired: false,
  startTrigger: '',
  ...overrides,
  actions: overrides.actions && overrides.actions.length
    ? overrides.actions.map(generateAction)
    : [generateAction()]
})

const generateDeploymentProcess = (overrides = {}) => ({
  id: 'DeploymentProcess-123',
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  lastSnapshotId: 'Snapshot-123',
  links: {},
  projectId: 'Projects-123',
  version: '1.0.0',
  ...overrides,
  steps: overrides.steps && overrides.steps.length
    ? overrides.steps.map(generateStep)
    : [generateStep()]
})

module.exports = { generateDeploymentProcess }
