'use strict'

const { createReleaseAndDeploy } = require('../../../lib/commands/create-release')
const { deployOptions } = require('../options')
const { logger, setApiConfig } = require('../../../lib/utils')
const ensureSpaceSet = require('../../../lib/commands/ensure-space-set')

const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 release deploy [options]')
    .options(deployOptions)
    .example(`$0 release deploy \\
      --host https://octopus.acme.com \\
      --apiKey API-123 \\
      --projectSlugOrId {my-project|Projects-123} \\
      --releaseVersion 2.0.0-rc-4 \\
      --packageVersion 1.0.1 \\
      --releaseNotes "Created release as post-build step" \\
      --environmentName Staging \\
      --comments "Automated deploy to Staging as post-build step" \\
      --variables "{ \\"host\\": \\"https://api.acme.com\\", \\"key\\": \\"its-a-secret-to-everybody\\" }" \\
      --machineIds Machines-123 Machines-456`)

const handler = async args => {
  const { host, apiKey, space, projectSlugOrId, releaseVersion, releaseNotes, packageVersion, environmentName, comments, machineIds } = args

  const variables = args.variables
    ? JSON.parse(args.variables)
    : {}

  const releaseParams = { projectSlugOrId, version: releaseVersion, releaseNotes, packageVersion }
  const deployParams = { environmentName, comments, variables, machineIds }

  setApiConfig({ host, apiKey })
  ensureSpaceSet.execute(space)

  logger.info(`Creating release and deploying project '${projectSlugOrId}' to '${environmentName}'`)

  try {
    await createReleaseAndDeploy(releaseParams, deployParams)
  } catch (err) {
    logger.error('Failed to create release and deploy. Error:', err.message)

    process.exitCode = 1
  }
}

module.exports = {
  command: 'deploy',
  describe: 'Create release and deploy to target environment',
  builder,
  handler
}
