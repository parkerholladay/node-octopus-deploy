#!/usr/bin/env node
'use strict'

const yargs = require('yargs')

// eslint-disable-next-line no-unused-expressions
yargs
  .usage('Usage:\n  $0 <command> [options]')
  .commandDir('./commands', { exclude: /options\.js$/ })
  .demandCommand(1, 'You must specify a command and options')
  .help()
  .alias('?', 'help')
  .wrap(100)
  .argv
