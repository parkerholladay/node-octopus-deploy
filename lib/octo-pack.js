'use strict'

const archiver = require('archiver')
const BPromise = require('bluebird')
const path = require('path')

const globWrapper = require('./utils/glob-wrapper')
const logger = require('./utils/logger')
const octopus = require('./octopus-deploy')

let archive
const contents = []
let fileCount

const handleGlobData = file => {
  fileCount++

  const base = path.join(file.cwd, file.base)
  const name = file.path.replace(base, '')
  archive.file(file.path, { name })
}

const handleGlobEnd = () => {
  if (fileCount === 0) {
    archive.emit('error', new Error('No files were found to add to package'))
    return
  }

  logger.info(`Packing ${fileCount} files...`)
  archive.finalize()
}

const readGlobs = (globs, options) => {
  const globOptions = { nodir: true }
  if (options.base) {
    globOptions.base = options.base
  }

  const globStream = globWrapper.getGlobStream(globs, globOptions)

  globStream.on('data', handleGlobData)
  globStream.on('end', handleGlobEnd)

  globStream.read()
}

const octopack = (globs, options = {}) => {
  fileCount = 0

  let archiveType = 'tar'
  let archiveOptions = { gzip: true }
  if (options.zip) {
    archiveType = 'zip'
    archiveOptions = { zlib: { level: 9 } }
  }

  archive = archiver.create(archiveType, archiveOptions)

  archive.on('data', chunk => contents.push(chunk))
  archive.on('warning', err => logger.error('Warning building archive', err))

  readGlobs(globs, options)

  return new BPromise((resolve, reject) => {
    archive.on('error', err => reject(err))
    archive.on('end', () => resolve(Buffer.concat(contents)))
  })
}

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

const publish = params => {
  const { name, version, extension, replace, contents } = params
  const fileName = `${name}.${version}.${extension}`
  logger.info(`Publishing package ${fileName}...`)

  return octopus.packages.create(fileName, replace, contents)
    .then(pkg => {
      const { title, version, fileExtension: extension, packageSizeBytes } = pkg
      const size = getFileSizeString(packageSizeBytes)

      return { title, version, extension, size }
    })
}

module.exports = {
  octopack,
  publish
}
