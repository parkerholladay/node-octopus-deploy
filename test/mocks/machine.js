'use strict'

const generateTentacleVersionDetails = (overrides = {}) => ({
  upgradeLocked: false,
  upgradeRequired: false,
  upgradeSuggested: false,
  version: '3.12.2',
  ...overrides
})

const generateEndpoint = (overrides = {}) => ({
  id: null,
  communicationStyle: 'TentaclePassive',
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  links: {},
  proxyId: null,
  thumbprint: '121DE7E5ABB0C47DF1A7A7104E40EB59BA63FA63',
  uri: 'https://machine.acme.com:10933/',
  ...overrides,
  tentacleVersionDetails: generateTentacleVersionDetails(overrides.tentacleVersionDetails)
})

const generateMachine = (overrides = {}) => ({
  id: 'Machines-123',
  environmentIds: ['Environments-123'],
  hasLatestCalamari: true,
  healthStatus: 'Healthy',
  isDisabled: false,
  isInProcess: false,
  links: {},
  machinePolicyId: 'MachinePolicies-123',
  name: 'i-003d12b210f86f535',
  roles: ['role-one'],
  status: 'Online',
  statusSummary: 'Octopus was able to successfully establish a connection with this machine on Thursday, January 1, 2017 12:00 PM',
  tenantIds: [],
  tenantTags: [],
  thumbprint: '120DE6E5ABB0C47DB1A7A7114E40EB59BF63EA63',
  uri: 'https://machine.acme.com:10933/',
  ...overrides,
  endpoint: generateEndpoint(overrides.endpoint)
})

module.exports = { generateMachine }
