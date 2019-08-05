const builder = yargs =>
  yargs
    .usage('Usage:\n  $0 release <create|deploy> [options]')
    .commandDir('./release-commands')
    .demandCommand(1, 'You must specify a command and options')
    .version(false)

module.exports = {
  command: 'release',
  describe: 'Create and optionally deploy a release',
  builder,
  handler: () => {}
}
