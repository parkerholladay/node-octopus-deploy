'use strict'

function generateReleaseCreationStrategy(overrides) {
  return Object.assign({},
    {
      releaseCreationPackageStepId: ''
    },
    overrides
  )
}

function generateVersioningStrategy(overrides) {
  return Object.assign({},
    {
      donorPackageStepId: null,
      template: '#{Octopus.Version.LastMajor}.#{Octopus.Version.LastMinor}.#{Octopus.Version.NextPatch}'
    },
    overrides
  )
}

function generateProject(overrides) {
  overrides = overrides || {}
  const { releaseCreationStrategy, versioningStrategy } = overrides
  delete overrides.releaseCreationStrategy
  delete overrides.versioningStrategy

  return Object.assign({},
    {
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
      releaseCreationStrategy: generateReleaseCreationStrategy(releaseCreationStrategy),
      slug: 'my-project-name',
      templates: [],
      tenantDeploymentMode: '',
      variableSetId: 'VariableSet-Projects-123',
      versioningStrategy: generateVersioningStrategy(versioningStrategy)
    },
    overrides
  )
}

module.exports = { generateProject }
