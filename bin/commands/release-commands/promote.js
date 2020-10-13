'use strict'

const { promoteRelease } = require('../../../lib/commands/create-release')
const { promoteOptions } = require('../options')
const { logger, setApiConfig } = require('../../../lib/utils')

const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 release promote [options]')
    .options(promoteOptions)
    .example(`$0 release deploy \\
      --host https://octopus.acme.com \\
      --apiKey API-123 \\
      --projectSlugOrId {my-project|Projects-123} \\
      --releaseVersion 1.2.1 \\
      --environmentName Production \\
      --comments "Automated deploy to Production as post-build step" \\
      --variables "{\\"SourceDir\\":\\"\\\\SOURCESERVER\\MyProject\\1.0.0-rc-3\\"}" \\
      --machineIds Machines-123 Machines-456`)

const handler = async args => {
  const { host, apiKey, projectSlugOrId, releaseVersion, environmentName, comments, machineIds } = args

  const variables = args.variables
    ? JSON.parse(args.variables)
    : {}

  const releaseParams = { projectSlugOrId, version: releaseVersion }
  const deployParams = { environmentName, comments, variables, machineIds }

  setApiConfig({ host, apiKey })

  logger.info(`Promoting release version '${releaseVersion}' for project '${projectSlugOrId}' to '${environmentName}'`)

  try {
    await promoteRelease(releaseParams, deployParams)
  } catch (err) {
    logger.error('Failed to create release and deploy. Error:', err.message)

    process.exitCode = 1
  }
}

module.exports = {
  command: 'promote',
  describe: 'Promote/deploy existing release to target environment',
  builder,
  handler
}
