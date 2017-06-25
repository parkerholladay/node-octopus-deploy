'use strict'

function createAction(overrides) {
  return Object.assign({},
    {
      id: 'Actions-123',
      actionType: '',
      channels: ['Channels-123'],
      environments: ['Environments-123'],
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      links: {},
      name: 'Step 1',
      properties: {},
      tenantTags: []
    },
    overrides
  )
}

function createStep(overrides) {
  overrides = overrides || {}
  const { actions } = overrides
  delete overrides.actions

  return Object.assign({},
    {
      id: 'Steps-123',
      actions: actions && actions.length
        ? actions.map(createAction)
        : [createAction()],
      condition: '',
      name: 'Step 1',
      properties: {},
      requiresPackagesToBeAcquired: false,
      startTrigger: ''
    },
    overrides
  )
}

function create(overrides) {
  overrides = overrides || {}
  const { steps } = overrides
  delete overrides.steps

  return Object.assign({},
    {
      id: 'DeploymentProcess-123',
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      lastSnapshotId: 'Snapshot-123',
      links: {},
      projectId: 'Projects-123',
      steps: steps && steps.length
        ? steps.map(createStep)
        : [createStep()],
      version: '1.0.0'
    },
    overrides
  )
}

module.exports = create
