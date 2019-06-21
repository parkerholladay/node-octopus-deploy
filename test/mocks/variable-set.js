'use strict'

const generateScopeValues = (overrides = {}) => ({
  environments: [
    { id: 'Environments-123', name: 'DEV' },
    { id: 'Environments-456', name: 'PROD' }
  ],
  machines: [
    { id: 'Machines-123', name: 'SERVER 123' },
    { id: 'Machines-456', name: 'SERVER 456' }
  ],
  actions: [
    { id: 'Actions-123', name: '1. Run Script' },
    { id: 'Actions-456', name: '2. Send Failed email' },
    { id: 'Actions-789', name: '3. Send Complete email' }
  ],
  roles: [
    { id: 'Roles-123', name: 'admin' }
  ],
  channels: [
    { id: 'Channels-123', name: 'Web Server' }
  ],
  tenantTags: [
    { id: 'TenantTags-123', name: 'A Tag' }
  ],
  ...overrides
})

const generateVariable = (overrides = {}) => ({
  id: 'Variables-123',
  isEditable: true,
  isSensitive: false,
  name: 'sourceDir',
  prompt: null,
  scope: {
    environment: ['Environments-123'],
    role: ['Roles-123']
  },
  value: '\\\\SOURCESERVER\\my-project',
  ...overrides
})

const generateVariableSet = (overrides = {}) => ({
  id: 'VariableSet-Projects-123',
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  links: {},
  ownerId: 'Projects-123',
  version: 1,
  ...overrides,
  scopeValues: generateScopeValues(overrides.scopeValues),
  variables: overrides.variables && overrides.variables.length
    ? overrides.variables.map(generateVariable)
    : [generateVariable()]
})

module.exports = { generateVariableSet }
