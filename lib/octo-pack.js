'use strict'

const archiver = require('archiver')
const path = require('path')

const gs = require('./utils/glob-wrapper')
const { logger } = require('./utils/logger')
const { Maybe } = require('./utils/maybe')
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

  const globStream = gs.getGlobStream(globs, globOptions)

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

  return new Promise((resolve, reject) => {
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

const publish = async params => {
  const { name, version, extension, replace, contents } = params
  const fileName = `${name}.${version}.${extension}`
  logger.info(`Publishing package ${fileName}...`)

  const newPackage = await octopus.packages.create(fileName, replace, contents)
  if (!newPackage.hasValue) {
    return Maybe.none()
  }

  const { title, version: actualVersion, fileExtension, packageSizeBytes } = newPackage.value
  const size = getFileSizeString(packageSizeBytes)

  return Maybe.some({ title, version: actualVersion, extension: fileExtension, size })
}

module.exports = {
  octopack,
  publish
}
