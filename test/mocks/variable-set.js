'use strict'

function createScopeValues(overrides) {
  overrides = overrides || {}

  return {
    environments: overrides.environments
      ? overrides.environments
      : [
        { id: 'Environments-123', name: 'DEV' },
        { id: 'Environments-456', name: 'PROD' }
      ],
    machines: overrides.machines
      ? overrides.machines
      : [
        { id: 'Machines-123', name: 'SERVER 123' },
        { id: 'Machines-456', name: 'SERVER 456' }
      ],
    actions: overrides.actions
      ? overrides.actions
      : [
        { id: 'Actions-123', name: '1. Run Script' },
        { id: 'Actions-456', name: '2. Send Failed email' },
        { id: 'Actions-789', name: '3. Send Complete email' }
      ],
    roles: overrides.roles
      ? overrides.roles
      : [
        { id: 'Roles-123', name: 'admin' }
      ],
    channels: overrides.channels
      ? overrides.channels
      : [
        { id: 'Channels-123', name: 'Web Server' }
      ],
    tenantTags: overrides.tenantTags
      ? overrides.tenantTags
      : [
        { id: 'TenantTags-123', name: 'A Tag' }
      ]
  }
}

function createVariable(overrides) {
  return Object.assign({},
    {
      id: 'Variables-123',
      isEditable: true,
      isSensitive: false,
      name: 'sourceDir',
      prompt: null,
      scope: {
        environment: ['Environments-123'],
        role: ['Roles-123']
      },
      value: '\\\\SOURCESERVER\\my-project'
    },
    overrides
  )
}

function create(overrides) {
  overrides = overrides || {}
  const { scopeValues, variables } = overrides
  delete overrides.scopeValues
  delete overrides.variables

  return Object.assign({},
    {
      id: 'VariableSet-Projects-123',
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      links: {},
      ownerId: 'Projects-123',
      scopeValues: createScopeValues(scopeValues),
      variables: variables && variables
        ? variables.map(createVariable)
        : [createVariable()],
      version: 1
    },
    overrides
  )
}

module.exports = create
