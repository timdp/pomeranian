#!/usr/bin/env node

import { argv } from 'node:process'

import yargs from 'yargs'

import { add } from '../lib/commands/add.js'
import { remove } from '../lib/commands/remove.js'

const scopeOptionBuilder = (yargs) =>
  yargs.option('scope', {
    alias: 's',
    type: 'string',
    desc: 'Dependency scope',
    choices: ['compile', 'provided', 'test', 'runtime', 'system', 'import'],
    default: 'compile',
  })

yargs(argv.slice(2))
  .command({
    command: 'add <id> [ids..]',
    aliases: ['a'],
    desc: 'Add dependencies',
    builder: scopeOptionBuilder,
    handler: add,
  })
  .command({
    command: 'remove [id] [ids..]',
    aliases: ['r'],
    desc: 'Remove dependencies',
    builder: scopeOptionBuilder,
    handler: remove,
  })
  .demandCommand()
  .option('yes', {
    alias: 'y',
    type: 'boolean',
    desc: 'Skip confirmation prompts',
  })
  .help()
  .strict()
  .parse()
