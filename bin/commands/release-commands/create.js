'use strict'

const { createRelease } = require('../../../lib/commands/create-release')
const { releaseOptions } = require('../options')
const { logger, setApiConfig } = require('../../../lib/utils')

const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 release create [options]')
    .options(releaseOptions)
    .example(`$0 release create \\
      --host https://octopus.acme.com \\
      --apiKey API-123 \\
      --projectSlugOrId {my-project|Projects-123} \\
      --releaseVersion 2.0.0-rc-4 \\
      --packageVersion 1.0.1 \\
      --releaseNotes "Created release as post-build step"`)

const handler = async args => {
  const { host, apiKey, projectSlugOrId, releaseVersion, releaseNotes, packageVersion } = args
  const params = { projectSlugOrId, version: releaseVersion, releaseNotes, packageVersion }

  setApiConfig({ host, apiKey })

  logger.info(`Creating release for project '${projectSlugOrId}'`)

  try {
    await createRelease(params)
  } catch (err) {
    logger.error('Failed to create release. Error:', err)

    process.exitCode = 1
  }
}

module.exports = {
  command: 'create',
  describe: 'Create release',
  builder,
  handler
}
