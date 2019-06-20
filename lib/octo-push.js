'use strict'

const api = require('./octopus-deploy')
const logger = require('./utils/logger')

const getFileSizeString = bytes => {
  const units = ['B', 'kB', 'MB', 'GB', 'TB']
  const kilobyte = 1024
  let unitIndex = 0

  while (bytes >= kilobyte && unitIndex < units.length) {
    bytes /= kilobyte
    unitIndex++
  }

  return `${unitIndex === 0 ? bytes : bytes.toFixed(2)} ${units[unitIndex]}`
}

const octopush = params => {
  const { name, version, extension, replace, contents } = params
  const fileName = `${name}.${version}.${extension}`
  logger.info(`Publishing package ${fileName}...`)

  return api.packages.create(fileName, replace, contents)
    .then(pkg => {
      const { title, version, fileExtension: extension, packageSizeBytes } = pkg
      const size = getFileSizeString(packageSizeBytes)

      return { title, version, extension, size }
    })
}

module.exports = octopush
