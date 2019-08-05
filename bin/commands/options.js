const baseOptions = {
  host: {
    alias: 'h',
    describe: 'The base url of the octopus deploy server',
    demandOption: true
  },
  apiKey: {
    alias: 'k',
    describe: 'Api key used to connect to octopus deploy',
    demandOption: true
  }
}

const releaseOptions = {
  ...baseOptions,
  projectSlugOrId: {
    alias: 'p',
    describe: 'The id or slug of the octopus project',
    demandOption: true
  },
  releaseVersion: {
    alias: 'v',
    describe: 'The SemVer of the release to create',
    demandOption: true
  },
  releaseNotes: {
    alias: 'o',
    describe: 'Notes to associate with the new release'
  },
  packageVersion: {
    alias: 's',
    describe: 'The SemVer of the packages to release'
  }
}

const deployOptions = {
  ...releaseOptions,
  environmentName: {
    alias: 'e',
    describe: 'The name of the environment to deploy to',
    demandOption: true
  },
  comments: {
    alias: 'c',
    describe: 'Deploy comments'
  },
  variables: {
    alias: 'l',
    describe: 'Deploy variables'
  },
  machineIds: {
    alias: 'm',
    describe: 'A list of machine ids to target',
    type: 'array'
  }
}

const octopackOptions = {
  ...baseOptions,
  packageName: {
    alias: 'n',
    describe: 'The name of the package',
    demandOption: true
  },
  packageVersion: {
    alias: 's',
    describe: 'The SemVer of the package',
    demandOption: true
  },
  globs: {
    alias: 'g',
    describe: 'A list of globs describing the files to package',
    type: 'array',
    demandOption: true
  },
  base: {
    alias: 'b',
    describe: 'The path to be used as the base for the packaged files'
  },
  replace: {
    alias: 'r',
    describe: 'Optional flag to replace package if it exists',
    default: false
  },
  zip: {
    alias: 'z',
    describe: 'Optional flag to use .zip format instead of .tar.gz',
    default: false
  }
}

module.exports = {
  baseOptions,
  deployOptions,
  octopackOptions,
  releaseOptions
}
