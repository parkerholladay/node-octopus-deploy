'use strict'

function create(overrides) {
  return Object.assign({},
    {
      id: 'Package-123',
      description: 'This is a package',
      feedId: 'Feed-123',
      fileExtension: '.tar.gz',
      lastModifiedBy: 'email@acme.com',
      lastModifiedOn: '2017-01-01T00:00:00+0000',
      libraryVariableSetSnapshotIds: [],
      links: {},
      nugetFeedId: 'NugetFeed-123',
      nugetPackageId: 'NugetPackage-123',
      packageId: 'Package-123',
      packageSizeBytes: 123,
      published: '2017-01-01T00:00:00+0000',
      releaseNotes: 'Release Notes Here - Testing Through REST API',
      summary: 'This is a summary about the package',
      title: 'Package title',
      version: '1.0.0-rc-3'
    },
    overrides
  )
}

module.exports = create
