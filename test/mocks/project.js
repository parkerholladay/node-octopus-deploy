'use strict'

const generateReleaseCreationStrategy = (overrides = {}) => ({
  releaseCreationPackageStepId: '',
  ...overrides
})

const generateVersioningStrategy = (overrides = {}) => ({
  donorPackageStepId: null,
  template: '#{Octopus.Version.LastMajor}.#{Octopus.Version.LastMinor}.#{Octopus.Version.NextPatch}',
  ...overrides
})

const generateProject = (overrides = {}) => ({
  id: 'Projects-123',
  autoCreateRelease: false,
  autoDeployReleaseOverrides: [],
  defaultToSkipIfAlreadyInstalled: false,
  deploymentProcessId: 'DeploymentProcess-Projects-123',
  description: 'Deploy my app to my servers',
  includedLibraryVariableSetIds: [],
  isDisabled: false,
  lastModifiedBy: 'email@acme.com',
  lastModifiedOn: '2017-01-01T00:00:00+0000',
  lifecycleId: 'Lifecycle-ProjectGroups-132',
  links: {},
  name: 'My Project Name',
  projectConnectivityPolicy: '',
  projectGroupId: 'ProjectGroups-123',
  slug: 'my-project-name',
  templates: [],
  tenantDeploymentMode: '',
  variableSetId: 'VariableSet-Projects-123',
  ...overrides,
  releaseCreationStrategy: generateReleaseCreationStrategy(overrides.releaseCreationStrategy),
  versioningStrategy: generateVersioningStrategy(overrides.versioningStrategy)
})

module.exports = { generateProject }
