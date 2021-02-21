'use strict'

const { promoteRelease } = require('../../../lib/commands/create-release')
const { promoteOptions } = require('../options')
const { logger, setApiConfig } = require('../../../lib/utils')
const ensureSpaceIsSet = require('../../../lib/commands/ensure-space-set')

const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 release promote [options]')
    .options(promoteOptions)
    .example(`$0 release promote \\
      --host https://octopus.acme.com \\
      --apiKey API-123 \\
      --projectSlugOrId {my-project|Projects-123} \\
      --releaseVersion 1.2.1 \\
      --environmentName Production \\
      --comments "Automated deploy to Production as post-build step" \\
      --variables "{ \\"host\\": \\"https://api.acme.com\\", \\"key\\": \\"its-a-secret-to-everybody\\" }" \\
      --machineIds Machines-123 Machines-456`)

const handler = async args => {
  const { host, space, apiKey, projectSlugOrId, releaseVersion, environmentName, comments, machineIds } = args

  const variables = args.variables
    ? JSON.parse(args.variables)
    : {}

  const releaseParams = { projectSlugOrId, version: releaseVersion }
  const deployParams = { environmentName, comments, variables, machineIds }

  setApiConfig({ host, apiKey })
  await ensureSpaceIsSet.execute(space)

  logger.info(`Promoting release version '${releaseVersion}' for project '${projectSlugOrId}' to '${environmentName}'`)

  try {
    await promoteRelease(releaseParams, deployParams)
  } catch (err) {
    logger.error('Failed to deploy release. Error:', err.message)

    process.exitCode = 1
  }
}

module.exports = {
  command: 'promote',
  describe: 'Promote/deploy existing release to target environment',
  builder,
  handler
}
