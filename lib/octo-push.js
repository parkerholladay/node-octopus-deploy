'use strict'

const api = require('./octopus-deploy')
const logger = require('./utils/logger')

const getFileSizeString = bytes => {
  const units = ['B', 'kB', 'MB', 'GB', 'TB']
  if (bytes < 1024) return `${bytes} ${units[0]}`

  let i = 0
  do {
    bytes /= 1024
    i++
  } while (bytes >= 1024 && i < units.length)

  return `${bytes.toFixed(2)} ${units[i]}`
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
