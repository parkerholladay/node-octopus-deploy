'use strict'

const { octopack, publish } = require('../../lib/commands/octo-pack')
const setSpace = require('../../lib/commands/set-space')
const { octopackOptions } = require('./options')
const { logger, setApiConfig } = require('../../lib/utils')

const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 octopack [options]')
    .options(octopackOptions)
    .example(`$0 octopack \\
      --host https://octopus.acme.com \\
      --apiKey API-123 \\
      --packageName my-package \\
      --packageVersion 2.0.0-rc-4 \\
      --globs './build/**' './node_modules/**' '!**/*.spec.*' \\
      --base ./ \\
      --replace \\
      --zip`)
    .version(false)

const handler = async args => {
  const { host, apiKey, space, packageName, packageVersion, globs, base, replace, zip } = args

  setApiConfig({ host, apiKey })
  setSpace.execute(space)

  const packageNameAndVersion = `${packageName} v${packageVersion}`
  logger.info(`Packing '${packageNameAndVersion}'...`)

  const extension = zip ? 'zip' : 'tar.gz'
  const packOptions = { base, zip }
  const publishParams = { name: packageName, version: packageVersion, extension, replace }

  try {
    const contents = await octopack(globs, packOptions)
    if (!contents.hasValue) {
      return
    }

    const pkg = await publish({ ...publishParams, contents: contents.value })
    if (!pkg.hasValue) {
      return
    }

    const { title, version, extension, size } = pkg.value

    logger.info(`Published package '${title}.${version}${extension}' (${size})`)
  } catch (err) {
    logger.error(`Failed to pack and publish '${packageNameAndVersion}'`, err.message)

    process.exitCode = 1
  }
}

module.exports = {
  command: 'octopack',
  describe: 'Publish a package to the octopus feed',
  builder,
  handler
}
