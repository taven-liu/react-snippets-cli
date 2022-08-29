#!/usr/bin/env node
const currentNodeVersion = process.versions.node
const semver = currentNodeVersion.split('.')
const major = semver[0]

if (major < 14) {
  console.error(
    'You are running Node ' +
      currentNodeVersion +
      '.\n' +
      'React snippets cli requires Node 14 or higher. \n' +
      'Please update your version of Node.'
  )
  process.exit(1)
}

const { init } = require('./react-snippets-cli')

init()
